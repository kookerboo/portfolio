const { SuperfaceClient } = require('@superfaceai/one-sdk');

const sdk = new SuperfaceClient({ sdkAuthToken: 'sfs_deeb23c262837f0164c89856fb0ad6865f3adb6413f7d90be3a31ac0c29d778d6d81b4bee332846da0fa4dd92e6e1a2ff9151768d27c6764191988e71dde2715_18c492d7' });

// Just check if all required fields are provided
function formValid(body) {
  return body.name && body.email && body.message;
}

export default async function handler(req, res) {
  const body = req.body;

  if (!formValid(body)) {
    res.status(422).end();
    return;
  }

  const profile = await sdk.getProfile('communication/send-email@2.2.0');
  const message = `
    Email: ${body.email}
    Name: ${body.name}  
    Message: ${body.message} 
    `;
  const result = await profile.getUseCase('SendEmail').perform(
    {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: 'Message from contact form',
      text: message,
    },
    {
      provider: 'sendgrid',
      security: {
        bearer_token: {
          token: process.env.SENDGRID_API_KEY,
        },
      },
    }
  );

  try {
    const data = result.unwrap();
    console.log(data);
    res.status(201).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}