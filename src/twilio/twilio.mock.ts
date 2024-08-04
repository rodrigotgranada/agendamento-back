export class MockTwilioService {
    async sendSms(to: string, body: string) {
      return { to, body };
    }
  }
  