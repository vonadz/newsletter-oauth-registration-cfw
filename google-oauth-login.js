addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});

// google secrets
const GOOGLE_CLIENT_ID = 'XXXX';
// newsletter secrets
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

  // redirect GET requests to the OAuth login page on google.com
  if (request.method === "GET") {
    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email&include_granted_scopes=true&response_type=token&redirect_uri=https%3A//abyteofcoding.com/success&GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}`,
      302
    );
  }
  
  try {
    const { access_token } = await request.json();

    const response = await fetch(
      `https://openidconnect.googleapis.com/v1/userinfo?access_token=${access_token}`,
      {
        method: "GET",
      }
    );
    const result = await response.json();
    const headers = {
      "Access-Control-Allow-Origin": "*",
    };



    if (result.error) {
      return new Response(JSON.stringify({response: 1, result: result}), { status: 401, headers });
    }
  
    const response2 = await fetch(`https://emailoctopus.com/api/1.5/lists/${NEWSLETTER_LIST_ID}/contacts`,
    {
        method: 'POST',
        headers: {
             "Content-Type": "application/json",
             accept: "application/json"
        },
        body: JSON.stringify({api_key: NEWSLETTER_API_KEY, email_address: result.email, fields: {SignedUpWith: 'GoogleOAuth'}})
        
    })
    const result2 = await response2.json();
      if (result2.error) {
        return new Response(JSON.stringify({response: 2, result: result2}), { status: 401, headers });
      }
    return new Response(JSON.stringify(result2), {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response(error.message, {
      status: 500,
      headers
    });
  }
}
