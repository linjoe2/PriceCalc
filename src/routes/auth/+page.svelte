<script>
    import { Account, OAuthProvider } from "appwrite";
    import { client } from "$lib/appwrite";

const account = new Account(client);

// Go to OAuth provider login page
account.createOAuth2Session(
    OAuthProvider.Oidc, // provider
    'http://localhost:5173/project', // redirect here on success
    'http://localhost:5173/fail', // redirect here on failure
    ['openid', 'profile', 'email'] // scopes (optional)
);
</script>