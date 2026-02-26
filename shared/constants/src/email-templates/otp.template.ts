export function otpEmailTemplate ({
    otp,
    email,
    subject
}: {
    otp: string;
    email: string;
    subject: string
}) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>${subject}</title>

    <style>
      /* Client-specific resets */
      html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
      * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
      table, td { mso-table-lspace:0pt !important; mso-table-rspace:0pt !important; }
      img { -ms-interpolation-mode:bicubic; }
      a { text-decoration:none; }

      /* Dark mode support (not all clients) */
      @media (prefers-color-scheme: dark) {
        .bg-body { background-color:#0b0c0f !important; }
        .bg-card { background-color:#12151a !important; }
        .text { color:#e6eaf2 !important; }
        .muted { color:#b3b8c3 !important; }
        .divider { background:#222733 !important; }
        .otp-box { background:#11141a !important; color:#e6eaf2 !important; border-color:#2b3242 !important; }
        .btn { background:#4f8cff !important; }
      }

      /* Mobile tweaks */
      @media screen and (max-width:600px) {
        .container { width:100% !important; }
        .px-32 { padding-left:20px !important; padding-right:20px !important; }
        .otp-box { font-size:24px !important; width:44px !important; }
        .h1 { font-size:22px !important; line-height:28px !important; }
      }

      /* Hide preheader text */
      .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    </style>
  </head>
  <body class="bg-body" style="margin:0; padding:0; background:#f3f5f9;">
    <div class="preheader">Your one-time password (OTP) is ${otp}. It expires in 5 minutes.</div>

    <!-- Full width wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f9;" class="bg-body">
      <tr>
        <td align="center" style="padding:24px 12px;">

          <!-- 600px container -->
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container" style="width:600px; max-width:600px;">

            <!-- Card -->
            <tr>
              <td class="bg-card" style="background:#ffffff; border-radius:16px; box-shadow:0 2px 12px rgba(16,24,40,0.06);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-radius:16px; overflow:hidden;">
                  <tr>
                    <td class="px-32" style="padding:32px;">
                      <!-- Title -->
                      <h1 class="h1 text" style="margin:0; font-family:'Segoe UI', Arial, sans-serif; font-size:24px; line-height:32px; color:#0b0c0f;">Verify your sign‑in</h1>
                      <p class="text" style="margin:8px 0 0; font-family:'Segoe UI', Arial, sans-serif; font-size:14px; line-height:22px; color:#384252;">Use the one‑time password (OTP) below to finish signing in to your account. This code will expire in <strong>5 minutes</strong>.</p>

                      <!-- Divider -->
                      <div class="divider" style="height:1px; line-height:1px; background:#eceff3; margin:24px 0;"></div>

                      <!-- OTP Boxes -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                        <tr>
                          <!-- Repeat/adjust number of boxes as needed -->
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[0]}</td>
                          <td style="width:10px;">&nbsp;</td>
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[1]}</td>
                          <td style="width:10px;">&nbsp;</td>
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[2]}</td>
                          <td style="width:10px;">&nbsp;</td>
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[3]}</td>
                          <td style="width:10px;">&nbsp;</td>
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[4]}</td>
                          <td style="width:10px;">&nbsp;</td>
                          <td class="otp-box" style="font-family:'Segoe UI', Arial, sans-serif; font-weight:700; font-size:28px; line-height:44px; text-align:center; letter-spacing:0; color:#0b0c0f; background:#f7f8fb; border:1px solid #e3e8ef; border-radius:10px; width:52px; height:52px;">${otp?.[5]}</td>
                        </tr>
                      </table>

                      <!-- Copyable fallback code -->
                      <p class="text" style="margin:16px 0 0; font-family:'Segoe UI', Arial, sans-serif; font-size:13px; line-height:20px; color:#5b6472;">Can’t see the boxes? Your code is <code style="background:#f7f8fb; border:1px solid #e3e8ef; border-radius:6px; padding:2px 6px; font-family:Menlo, Consolas, Monaco, monospace; font-size:13px; color:#0b0c0f;">${otp}</code></p>

                      <!-- Help text -->
                      <p class="muted" style="margin:20px 0 0; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; line-height:18px; color:#7a8494;">If you didn’t request this, you can safely ignore this email or <a href="https://example.com/support" target="_blank" style="color:#3662FF; text-decoration:underline;">contact support</a>.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:20px 12px 0;">
                <p class="muted" style="margin:0; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; line-height:18px; color:#7a8494;">You’re receiving this email because a sign‑in was requested for <strong>${email}</strong>.</p>
                <p class="muted" style="margin:8px 0 0; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; line-height:18px; color:#7a8494;">© 2025 Nuboo</p>
                <p class="muted" style="margin:4px 0 0; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; line-height:18px; color:#7a8494;">
                  <a href="https://example.com/privacy" target="_blank" style="color:#7a8494; text-decoration:underline;">Privacy</a> ·
                  <a href="https://example.com/settings" target="_blank" style="color:#7a8494; text-decoration:underline;">Email preferences</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
