import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Header,
  Message,
  Icon,
  Segment,
} from "semantic-ui-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Login.css";

function Login() {
  const { role: roleParam } = useParams(); // e.g., "admin" or "qc"
  const navigate = useNavigate();
  const { login, error, loading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoCredentials, setDemoCredentials] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(roleParam === "admin" ? "/admin" : "/qc");
    }
  }, [isAuthenticated, navigate, roleParam]);

  // Set demo credentials based on role
  useEffect(() => {
    if (roleParam === "admin") {
      setDemoCredentials({
        email: "admin@intrack.com",
        password: "admin123",
        role: "Admin",
      });
    } else if (roleParam === "qc") {
      setDemoCredentials({
        email: "qc@intrack.com",
        password: "qc123",
        role: "QC Manager",
      });
    }
  }, [roleParam]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = login(email, password);

    // If login is synchronous, redirect immediately
    if (result?.success) {
      setTimeout(() => {
        navigate(roleParam === "admin" ? "/admin" : "/qc");
      }, 500);
    }
  };

  const handleDemoLogin = () => {
    if (demoCredentials) {
      const result = login(demoCredentials.email, demoCredentials.password);
      if (result?.success) {
        setTimeout(() => {
          navigate(roleParam === "admin" ? "/admin" : "/qc");
        }, 500);
      }
    }
  };

  const handleBackToRoles = () => {
    navigate("/");
  };

  if (!demoCredentials) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <Container textAlign="center" style={{ marginTop: "80px" }}>
        <Icon name="industry" size="huge" />
        <Header as="h1" style={{ marginBottom: "10px" }}>
          InTrack Login
        </Header>
        <p style={{ marginBottom: "40px", color: "#666" }}>
          {demoCredentials.role} Access
        </p>

        <Segment
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            padding: "30px",
          }}
        >
          {error && (
            <Message negative>
              <Message.Header>Login Failed</Message.Header>
              <p>{error}</p>
            </Message>
          )}

          <Form onSubmit={handleSubmit} loading={loading}>
            <Form.Field>
              <label>Email</label>
              <input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </Form.Field>

            <Form.Field>
              <label>Password</label>
              <input
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </Form.Field>

            <Button
              primary
              fluid
              size="large"
              type="submit"
              disabled={loading}
              loading={loading}
            >
              Login
            </Button>
          </Form>

          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <p style={{ color: "#999", fontSize: "12px" }}>Demo Credentials:</p>
            <p style={{ fontSize: "13px", marginBottom: "10px" }}>
              Email: <strong>{demoCredentials.email}</strong>
            </p>
            <p style={{ fontSize: "13px", marginBottom: "15px" }}>
              Password: <strong>{demoCredentials.password}</strong>
            </p>
            <Button
              secondary
              fluid
              size="small"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Quick Login (Demo)
            </Button>
          </div>
        </Segment>

        <Button basic style={{ marginTop: "20px" }} onClick={handleBackToRoles}>
          Back to Role Selection
        </Button>
      </Container>
    </div>
  );
}

export default Login;
