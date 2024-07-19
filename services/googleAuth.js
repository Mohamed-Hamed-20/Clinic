import { google } from "googleapis";

class GoogleAuth {
  constructor() {
    this.client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
  }

  async generateAuthUrl() {
    const url = this.client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
        "https://www.googleapis.com/auth/user.gender.read",
        "https://www.googleapis.com/auth/user.birthday.read",
        "https://www.googleapis.com/auth/user.addresses.read",
        "https://www.googleapis.com/auth/contacts.readonly",
      ],
    });
    return url;
  }

  async getUserInfo(code) {
    const { tokens } = await this.client.getToken(code);
    this.client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: this.client,
      version: "v2",
    });

    const people = google.people({
      version: "v1",
      auth: this.client,
    });

    const userInfo = await oauth2.userinfo.get();
    const user = userInfo.data;

    const peopleInfo = await people.people.get({
      resourceName: "people/me",
      personFields: "phoneNumbers,genders,birthdays,addresses",
    });

    const additionalInfo = peopleInfo.data;

    const highResPicture = user.picture.replace(/=s96-c$/, "");

    return {
      ...user,
      picture: highResPicture,
      phoneNumber: additionalInfo?.phoneNumbers,
      gender: additionalInfo?.genders[0]?.value,
      birthday: additionalInfo.birthdays[0].date || null,
      addresses: additionalInfo?.addresses,
    };
  }
}

export default GoogleAuth;
