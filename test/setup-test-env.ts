import { installGlobals } from "react-router";
import "@testing-library/jest-dom/extend-expect";

installGlobals({ nativeFetch: true });
