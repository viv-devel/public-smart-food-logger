import Link from "next/link";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const NetlifyIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>Netlify</title>
    <path d="M6.49 19.04h-.23L5.13 17.9v-.23l1.73-1.71h1.2l.15.15v1.2L6.5 19.04ZM5.13 6.31V6.1l1.13-1.13h.23L8.2 6.68v1.2l-.15.15h-1.2L5.13 6.31Zm9.96 9.09h-1.65l-.14-.13v-3.83c0-.68-.27-1.2-1.1-1.23-.42 0-.9 0-1.43.02l-.07.08v4.96l-.14.14H8.9l-.13-.14V8.73l.13-.14h3.7a2.6 2.6 0 0 1 2.61 2.6v4.08l-.13.14Zm-8.37-2.44H.14L0 12.82v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14Zm17.14 0h-6.58l-.14-.14v-1.64l.14-.14h6.58l.14.14v1.64l-.14.14ZM11.05 6.55V1.64l.14-.14h1.65l.14.14v4.9l-.14.14h-1.65l-.14-.13Zm0 15.81v-4.9l.14-.14h1.65l.14.13v4.91l-.14.14h-1.65l-.14-.14Z" />
  </svg>
);

const GeminiIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>Google Gemini</title>
    <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
  </svg>
);

const FitbitIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={className}
  >
    <title>Fitbit</title>
    <path d="M13.298 1.825c0 .976-.81 1.785-1.786 1.785-.972 0-1.784-.81-1.784-1.785 0-.973.813-1.785 1.784-1.785.976 0 1.786.813 1.786 1.785zm-1.786 3.243c-1.052 0-1.863.81-1.863 1.866 0 1.053.81 1.865 1.865 1.865 1.053 0 1.865-.811 1.865-1.865s-.825-1.866-1.875-1.866h.008zm0 5.029c-1.052 0-1.945.891-1.945 1.945s.894 1.945 1.947 1.945 1.946-.891 1.946-1.945-.894-1.945-1.946-1.945h-.002zm0 5.107c-1.052 0-1.863.81-1.863 1.864s.81 1.866 1.865 1.866c1.053 0 1.865-.811 1.865-1.866 0-.972-.825-1.864-1.875-1.864h.008zm0 5.191c-.972 0-1.784.809-1.784 1.784 0 .97.813 1.781 1.784 1.781.977 0 1.786-.809 1.786-1.784 0-.973-.81-1.781-1.786-1.781zM16.46 4.823c-1.136 0-2.108.977-2.108 2.111 0 1.134.973 2.107 2.108 2.107 1.135 0 2.106-.975 2.106-2.107 0-1.135-.972-2.109-2.106-2.109v-.002zm0 5.03c-1.216 0-2.19.973-2.19 2.19 0 1.216.975 2.187 2.19 2.187 1.215 0 2.189-.971 2.189-2.189 0-1.216-.974-2.188-2.189-2.188zm0 5.108c-1.136 0-2.108.976-2.108 2.107 0 1.135.973 2.109 2.108 2.109 1.135 0 2.106-.976 2.106-2.109s-.971-2.107-2.106-2.107zm5.106-5.353c-1.296 0-2.43 1.055-2.43 2.434 0 1.297 1.051 2.433 2.43 2.433 1.381 0 2.434-1.065 2.434-2.444-.082-1.382-1.135-2.431-2.434-2.431v.008zM6.486 5.312c-.892 0-1.62.73-1.62 1.623 0 .891.729 1.62 1.62 1.62.893 0 1.619-.729 1.619-1.62 0-.893-.727-1.62-1.619-1.62v-.003zm0 5.027c-.973 0-1.703.729-1.703 1.703 0 .975.721 1.703 1.695 1.703s1.695-.73 1.695-1.703c0-.975-.735-1.703-1.71-1.703h.023zm0 5.107c-.892 0-1.62.731-1.62 1.62 0 .895.729 1.623 1.62 1.623.893 0 1.619-.735 1.619-1.635s-.727-1.62-1.619-1.62v.012zm-5.025-4.863c-.813 0-1.461.646-1.461 1.459 0 .81.648 1.459 1.46 1.459.81 0 1.459-.648 1.459-1.459s-.648-1.459-1.458-1.459z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
      <div className="flex justify-center gap-4 mb-2">
        <Link href="/terms" className="text-gray-400 hover:text-gray-200">
          利用規約
        </Link>
        <Link href="/privacy" className="text-gray-400 hover:text-gray-200">
          プライバシーポリシー
        </Link>
      </div>

      <div className="flex justify-center items-center gap-2">
        <p>© {new Date().getFullYear()} vivviv. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/viv-devel/public-smart-food-logger"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 opacity-50 hover:opacity-100 hover:text-white transition-all"
            aria-label="GitHub Repository"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.netlify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 opacity-50 hover:opacity-100 hover:text-[#20C6B7] transition-all"
            aria-label="Powered by Netlify"
          >
            <NetlifyIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.fitbit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 opacity-50 hover:opacity-100 hover:text-[#00B0B9] transition-all"
            aria-label="Works with Fitbit"
          >
            <FitbitIcon className="h-4 w-4" />
          </a>
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 opacity-50 hover:opacity-100 hover:text-[#4E88D4] transition-all"
            aria-label="Built with Gemini"
          >
            <GeminiIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
