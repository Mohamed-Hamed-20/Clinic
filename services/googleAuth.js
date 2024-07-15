import { OAuth2Client } from "google-auth-library";

class GoogleAuth {
  constructor() {
    console.log(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
    this.client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
  }

  // generate link to login with google Auth
  async generateAuthUrl() {
    const url = this.client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
        "https://www.googleapis.com/auth/user.birthday.read",
        "https://www.googleapis.com/auth/user.addresses.read",
      ],
    });
    return url;
  }

  async getUserInfo(code) {
    // after you send code you with this ==   access_token  ,  refresh_token  ,   scope  ,  token_type  ,   id_token   ====
    const { tokens } = await this.client.getToken(code);
    console.log({ tokens });
    // بتبعت ليا ال الداتا دى علشان خيا تعرفك
    this.client.setCredentials(tokens);

    // بتعمل ticket
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    console.log({ ticket });

    // بتاخد الداتا من ال payload
    const payload = ticket.getPayload();

    console.log({ payload });
    const user = {
      id: payload["sub"],
      name: payload["name"],
      email: payload["email"],
      picture: payload["picture"],
    };

    return user;
  }
}

export default GoogleAuth;
