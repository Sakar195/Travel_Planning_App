import React from "react";
import Alert from "./Alert";

const ErrorMessage = ({
  message,
  className = "",
  isDismissible = false,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <Alert
      variant="error"
      title="Error"
      isDismissible={isDismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {message}
    </Alert>
  );
};

export default ErrorMessage;
