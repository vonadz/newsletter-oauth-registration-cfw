# newsletter-oauth-registration-cfw

The two files demonstrate how users can subscribe to a newsletter using Google and Github OAuth. 
Most of the code is based off of the example here: https://github.com/gr2m/cloudflare-worker-github-oauth-login
but has been simplified for this specific use case.

### Usage
In order to use these files, one can copy and paste them into your Cloudflare worker. Adjust the secrets variables at the top of either file for your specific use case. Furthermore, these examples use EmailOctopus API as the newsletter service provider. You will have to change the URL and maybe the handling of the return variables for the requests that hit the API.

### Other Info
Currently used for OAuth sign up for the [A Byte of Coding newsletter](https://abyteofcoding.com).
