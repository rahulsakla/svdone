export const socialConfig = {
  enabled: false,
  socialPlatforms: [], // Currently we only support Facebook and Google signin. We'll add more in future
  google: {
    expoGo: {
      clientId:
        "11223344556677-7uod8jkkjhjhgffcfn05g5m0gsqqd.apps.googleusercontent.com",
    },
    iOS: {
      clientId:
        "11223344556677-1cs1vrjhghgvjhgvgvhbhhg2p1tiibhe.apps.googleusercontent.com",
    },
    android: {
      clientId:
        "11223344556677-a24is4gjytfyt8dve47gdffsfreff1.apps.googleusercontent.com",
    },
  },
  facebook: {
    appID: "11223344556677",
    appName: "YourApp",
    android: {},
    iOS: {},
  },
};
