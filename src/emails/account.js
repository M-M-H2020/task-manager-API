const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SG_API_KEY);

exports.sendWelcomeEmail = (email, name) => {
    sgMail.send({
			to: email,
            from: 'cpe20172023@students.aduc.ac.ae',
            subject:'Thanks for joining in!',
            text:`Welcome to the app. ${name} Let me know how you get along with the app.`
		})
}
exports.sendCancellationEmail = (email, name) => {
    sgMail.send({
			to: email,
            from: 'cpe20172023@students.aduc.ac.ae',
            subject:'Cancellation email',
            text:`Hi ${name}, we sad that our service didn't meet your expectation, can we know why you didn't like it?`
		});
}
