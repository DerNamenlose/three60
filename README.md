# Three60

A very, very simple 360° review tool. Supports self-registration of users and limiting the registration to certain email address domains.

## Caution

While this is getting more and more into shape and I am trying my best to create a secure system, it still is just a toy for me to experiment with SvelteKit 
and a few other libraries. Use in production at your own risk!

## Installation

- `npm install`
- `npm run build`

This will give you the compiled application in `./build`, which you can run with `node build/index.js`.

There is also a [`Dockerfile`](./Dockerfile) of sorts, so feel free to give `docker build .` a spin.

## Configuration

Three60 accepts various configuration options through environment variables:

- `DATABASE_URL` (required) - Configures the database connection. Three60 only supports MySQL databases at the moment. Example: `mysql://user:password@db-host:3306/three60`
- `ENABLE_REGISTER` - Enable user self registration. Since there is no admin interface yet, you should probably set this to `true`
- `ALLOWABLE_DOMAINS` - Limit the domains people can use in their email addresses when registering an account. If empty, all domains are allowable. Multiple domains are separated by comma.
- `EMAIL_VERIFICATION_DISABLED` - Disable verification of emails on registration. If this is `true`, no verification emails will be sent out and accounts will be immediately enabled. **Be careful with this type of setup in a public environment, as this will allow anybody to register with any mail address, even if they don't actually own it.**
  
  *Note:* When email verification is enabled, the email config below becomes required.
 
- `SENDER_FROM` - The `From:` header of all emails sent. Can have the form "Name <address@example.com>". Make sure, that emails with this sender can be sent via the email host configured below.
- `EMAIL_SERVER_HOST` - The SMTP server to send the emails through.
- `EMAIL_SERVER_USER` - The username used to authenticate at the email server to send emails.
- `EMAIL_SERVER_PASSWORD` - The password used to authenticate at the email server to send emails.