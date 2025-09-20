import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Message } from "semantic-ui-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const { login, error, isAdmin, isQCManager } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);

    if (result.success) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isQCManager) {
        navigate("/qc-manager");
      }
    } else {
      setFormError(result.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit} error={!!formError || !!error}>
      <Form.Input
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Form.Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {(formError || error) && <Message error content={formError || error} />}
      <Button type="submit" color="red">
        Login
      </Button>
    </Form>
  );
}
