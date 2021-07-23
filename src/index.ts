import RingCentral from '@rc-ex/core';
import waitFor from 'wait-for-async';
import PubNubExtension from '@rc-ex/pubnub';
import {ExtensionTelephonySessionsEvent} from '@rc-ex/core/lib/definitions';

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
    async message => {
      // console.log(JSON.stringify(message, null, 2));
      const event = message as ExtensionTelephonySessionsEvent;
      const parties = event.body?.parties?.filter(
        p => p.status?.code === 'Answered'
      );
      if (parties && parties.length > 0) {
        console.log('call answered');
        await waitFor({interval: 1000});
        const party = parties[0];
        const r = await rc
          .restapi()
          .account()
          .telephony()
          .sessions(event.body?.telephonySessionId)
          .parties(party.id)
          .transfer()
          .post({
            extensionNumber: process.env.RINGCENTRAL_FORWARD_TO_EXTENSION,
          });
        console.log(r);
      }
    }
  );

  await waitFor({interval: 60000});
  await rc.revoke();
})();
