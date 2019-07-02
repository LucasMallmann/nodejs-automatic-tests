const { User } = require("../models");
const Mail = require("../services/MailService");

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = await user.generateToken();

    await Mail.send({
      from: "Lucas Mallmann <lucasmallmann76@gmail.com>",
      to: `${user.name} <${user.email}>`,
      subject: "New access to your account",
      text: "Hey, we registered a new access in your account"
    });

    return res.status(200).json({ token });
  }
}

module.exports = new SessionController();
