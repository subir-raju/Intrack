import React from "react";
import { Loader, Container } from "semantic-ui-react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Container text textAlign="center" style={{ marginTop: "100px" }}>
      <Loader active inline size="large" />
      <p>{message}</p>
    </Container>
  );
}

export default LoadingSpinner;
