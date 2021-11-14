addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

// Github secrets 
const client_id = 'XXXX';
const client_secret = 'XXXX';
// Newsletter secrets
const NEWSLETTER_API_KEY = 'XXXX';
const NEWSLETTER_LIST_ID = 'XXXX';

async function handle(request) {
  // handle CORS pre-flight request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // redirect GET requests to the OAuth login page on github.com
  if (request.method === "GET") {
    return Response.redirect(
      `https://github.com/login/oauth/authorize?client_id=${client_id}`,
      302
    );
  }

  try {
    const { code } = await request.json();

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "cloudflare-worker-github-oauth-login-demo",
          accept: "application/json",
        },
        body: JSON.stringify({ client_id, client_secret, code }),
      }
    );
    const result = await response.json();

    const headers = {
      "Access-Control-Allow-Origin": "*",
    };

    if (result.error) {
      return new Response(JSON.stringify({response: 1, result: result}), { status: 401, headers });
    }

    const response2 = await fetch('https://api.github.com/user/emails', {
        headers: {
          accept: 'application/vnd.github.v3+json',
          "user-agent": "cloudflare-worker-github-oauth-login-demo",
          authorization: `token ${result.access_token}`,
        },
      });

    const result2 = await response2.json();
      if (result2.error) {
        return new Response(JSON.stringify({response: 2, result: result2}), { status: 401, headers });
      }
      const primaryEmail = result2.filter((e) => e.primary && e.verified);
      if (!primaryEmail || primaryEmail.length === 0) {
        return new Response(JSON.stringify({message: 'No email attached to Github user.'}), { status: 401, headers });

      }

    const response3 = await fetch(`https://emailoctopus.com/api/1.5/lists/${NEWSLETTER_LIST_ID}/contacts`,
    {
        method: 'POST',
        headers: {
             "Content-Type": "application/json",
             accept: "application/json"
        },
        body: JSON.stringify({api_key: NEWSLETTER_API_KEY, email_address: primaryEmail[0].email, fields: {SignedUpWith: 'GithubOAuth'}})
        
    })
    const result3 = await response3.json();
      if (result3.error) {
        return new Response(JSON.stringify({response: 3, result: result3}), { status: 401, headers });
      }
    return new Response(JSON.stringify(result3), {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response(error.message, {
      status: 500,
    });
  }
}
