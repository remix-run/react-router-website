import * as React from "react";
import { useLocation } from "react-router-dom";
import { useTransition, useBeforeUnload } from "remix";

let positions: { [key: string]: number } = {};

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
  let sessionPositions = sessionStorage.getItem("positions");
  if (sessionPositions) {
    positions = JSON.parse(sessionPositions);
  }
}

// function useScrollRestoration() {
//   let location = useLocation();
//   let transition = useTransition();

//   let wasSubmissionRef = React.useRef(false);

//   React.useEffect(() => {
//     if (transition.location) {
//       positions[location.key] = window.scrollY;
//     }
//   }, [transition, location]);

//   useBeforeUnload(
//     React.useCallback(() => {
//       positions[location.key] = window.scrollY;
//       sessionStorage.setItem("positions", JSON.stringify(positions));
//     }, [])
//   );

//   if (typeof window !== "undefined") {
//     React.useLayoutEffect(() => {
//       let y = positions[location.key];

//       // been here before, scroll to it (maybe want history action?)
//       if (y) {
//         window.scrollTo(0, y);
//         return;
//       }

//       // try to scroll to the hash
//       if (location.hash) {
//         let el = document.querySelector(location.hash);
//         if (el) {
//           el.scrollIntoView();
//           return;
//         }
//       }

//       if (wasSubmissionRef.current === true) {
//         wasSubmissionRef.current = false;
//         return;
//       }

//       // otherwise go to the top!
//       window.scrollTo(0, 0);
//     }, [location]);
//   }

//   React.useEffect(() => {
//     if (transition.submission) {
//       wasSubmissionRef.current = true;
//     }
//   }, [transition]);
// }

function useScrollRestoration() {
  let location = useLocation();
  let transition = useTransition();

  let wasSubmissionRef = React.useRef(false);

  React.useEffect(() => {
    if (transition.submission) {
      wasSubmissionRef.current = true;
    }
  }, [transition]);

  React.useEffect(() => {
    let savePosition = () => {
      positions[location.key] = window.scrollY;
    };
    window.addEventListener("scroll", savePosition);
    return () => window.removeEventListener("scroll", savePosition);
  }, [location]);

  useBeforeUnload(
    React.useCallback(() => {
      sessionStorage.setItem("positions", JSON.stringify(positions));
    }, [])
  );

  if (typeof window !== "undefined") {
    React.useLayoutEffect(() => {
      let y = positions[location.key];

      // been here before, scroll to it
      if (y) {
        window.scrollTo(0, y);
        return;
      }

      // try to scroll to the hash
      if (location.hash) {
        let el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView();
          return;
        }
      }

      // don't do anything on submissions
      if (wasSubmissionRef.current === true) {
        wasSubmissionRef.current = false;
        return;
      }

      // otherwise go to the top on new locations
      window.scrollTo(0, 0);
    }, [location]);
  }

  React.useEffect(() => {
    if (transition.submission) {
      wasSubmissionRef.current = true;
    }
  }, [transition]);
}

export { useScrollRestoration };
