import RingCentral from '@rc-ex/core';
import waitFor from 'wait-for-async';
import PubNubExtension from '@rc-ex/pubnub';

(async () => {
  const rc = new RingCentral({
    server: process.env.RINGCENTRAL_SERVER_URL,
    clientId: process.env.RINGCENTRAL_CLIENT_ID,
    clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
  });
  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);

  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });

  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    message => {
      console.log(message);
    }
  );

  await waitFor({interval: 60000});
  await rc.revoke();
})();
