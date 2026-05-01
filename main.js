import { UserManager } from "oidc-client-ts";

const BASE_URL = "https://d1m2xbzaoegy0p.cloudfront.net";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_2ZvLIx3Nt",
    client_id: "5equ5odtfc32s32a4gsc063nhs",
   redirect_uri: "https://d1m2xbzaoegy0p.cloudfront.net/",
    response_type: "code",
    scope: "email openid phone"
};

export const userManager = new UserManager({ ...cognitoAuthConfig });

export async function signOutRedirect() {
    const clientId = "5equ5odtfc32s32a4gsc063nhs";
    const logoutUri = "https://d1m2xbzaoegy0p.cloudfront.net";
    const cognitoDomain = "https://ap-south-12zvlix3nt.auth.ap-south-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};