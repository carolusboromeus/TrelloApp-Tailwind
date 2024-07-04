import Home from "@/app/home";
import "./globals.css";
import { Inter } from "next/font/google";
import 'font-awesome/css/font-awesome.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import PropTypes from 'prop-types';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Byon Task Management",
  description: "Byon task management the visual work management tool that empowers teams to ideate, plan, manage, productive, and organized way",
};

export default function RootLayout({ modal, children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Home children={children} modal={modal}/>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.ReactNode,
  modal: PropTypes.object,
};
