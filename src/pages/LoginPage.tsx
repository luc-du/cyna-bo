import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Lock, Mail, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../store/authStore";
import type { RootState } from "../store/store";
import store from "../store/store";
import logo from "../assets/cyna.jpeg";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<typeof store.dispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const RECAPTCHA_SITE_KEY = "6Lc02VcrAAAAAIpBxoS5Rc22Q5nl9ljJQBZoJZTb"; // Clé front reCAPTCHA

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.error("Veuillez valider le captcha.");
      return;
    }

    try {
      console.log("Form data submitted:", formData);
      if (isSignup) {
        await dispatch(
          registerUser({
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password,
            captchaToken, // Ajout du token captcha
          })
        ).unwrap();
        toast.success(
          "Inscription réussie ! Notre administrateur doit vérifier votre compte, vérifiez votre boîte mail pour plus d'informations.",
          { duration: 8000 }
        );
      } else {
        await dispatch(
          loginUser({ email: formData.email, password: formData.password, captchaToken }) // Ajout du token captcha
        ).unwrap();
        toast.success("Connexion réussie");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <img className="mx-auto h-12 w-auto" src={logo} alt="Cyna Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? "Créer un compte" : "Connectez-vous à votre compte"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <label htmlFor="firstname" className="sr-only">
                  Prénom
                </label>
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Prénom"
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                />
              </div>
              <div className="relative">
                <label htmlFor="lastname" className="sr-only">
                  Nom
                </label>
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Nom"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">
                Adresse e-mail
              </label>
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isSignup ? "" : "rounded-t-md"
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                className="appearance-none rounded-b-md relative block w-full px-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading
                ? "Traitement..."
                : isSignup
                ? "S'inscrire"
                : "Se connecter"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignup
                ? "Vous avez déjà un compte ? Connectez-vous"
                : "Vous n'avez pas de compte ? Inscrivez-vous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
