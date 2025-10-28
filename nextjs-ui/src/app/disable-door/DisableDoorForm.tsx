"use client";

import { useState } from "react";
import {
  DoorOpen,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import styled from "styled-components";

interface Message {
  text: string;
  $type: "success" | "error";
}

interface MessageBoxProps {
  $type: "success" | "error";
}

interface StatusBadgeProps {
  $disabled: boolean;
}

interface ActionButtonProps {
  $disabled: boolean;
}

interface DisableDoorFormProps {
  initialDoorDisabled: boolean;
}

const Container = styled.div`
  min-height: 100vh;
  background: 
    
    ${(props) => props.theme.colors.primary} 0%,
  );
  padding: ${(props) => props.theme.spacing.xl};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.text};
  font-size: 1.5rem;
  font-weight: bold;

  span {
    font-size: 1.25rem;
  }
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  font-size: 2.5rem;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  color: ${(props) => props.theme.colors.text};
  backdrop-filter: blur(10px);

  h3 {
    margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    opacity: 0.9;
    line-height: 1.5;
    font-size: 0.875rem;
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  margin: 0 auto;
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};

  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: ${(props) => props.theme.colors.text};
    font-weight: 600;
  }

  p {
    margin: ${(props) => props.theme.spacing.xs} 0 0 0;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.div<StatusBadgeProps>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  background: ${(props) =>
    props.$disabled ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"};
  color: ${(props) =>
    props.$disabled ? props.theme.colors.danger : props.theme.colors.success};
  border: 1px solid
    ${(props) =>
      props.$disabled ? props.theme.colors.danger : props.theme.colors.success};
`;

const CardBody = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl} 0;

  h4 {
    margin: ${(props) => props.theme.spacing.md} 0
      ${(props) => props.theme.spacing.sm} 0;
    font-size: 1.3rem;
    color: ${(props) => props.theme.colors.text};
    font-weight: 600;
  }

  p {
    margin: 0;
    color: ${(props) => props.theme.colors.textSecondary};
    font-size: 0.95rem;
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const MessageBox = styled.div<MessageBoxProps>`
  margin-bottom: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  background: ${(props) =>
    props.$type === "success"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(239, 68, 68, 0.1)"};
  color: ${(props) =>
    props.$type === "success"
      ? props.theme.colors.success
      : props.theme.colors.danger};
  border: 1px solid
    ${(props) =>
      props.$type === "success"
        ? props.theme.colors.success
        : props.theme.colors.danger};
  animation: slideIn 0.3s ease forwards;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ActionButton = styled.button<ActionButtonProps>`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  transition: all 0.3s ease;
  background: ${(props) =>
    props.$disabled ? props.theme.colors.success : props.theme.colors.danger};
  color: ${(props) => props.theme.colors.text};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function DisableDoorForm({
  initialDoorDisabled,
}: DisableDoorFormProps) {
  const [message, setMessage] = useState<Message | null>(null);
  const [doorDisabled, setDoorDisabled] = useState(initialDoorDisabled);
  const [loading, setLoading] = useState(false);

  const API_URL = "/api/door";

  const handleToggle = async () => {
    setLoading(true);
    setMessage(null);

    const newLockState = !doorDisabled;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lock: newLockState }),
      });

      const data = await response.json();

      if (response.ok) {
        setDoorDisabled(newLockState);
        setMessage({
          text: `Door ${newLockState ? "disabled" : "enabled"} successfully`,
          $type: "success",
        });
      } else {
        setMessage({
          text:
            data.detail ||
            `Failed to ${newLockState ? "disable" : "enable"} door`,
          $type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Failed to connect to door system",
        $type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Logo>
          <DoorOpen size={28} />
          <span>SmartDoor</span>
        </Logo>
      </Header>

      <Title>Door Lock Control</Title>
      <Subtitle>Enable or disable manual door access</Subtitle>

      <InfoBox>
        <AlertTriangle size={20} />
        <div>
          <h3>What does this do?</h3>
          <p>
            When disabled, the manual door lock is engaged. Physical access will
            be restricted until you enable it again.
          </p>
        </div>
      </InfoBox>

      <Card>
        <CardHeader>
          <div>
            <h3>Front Door</h3>
            <p>Main Entrance</p>
          </div>
          <StatusBadge $disabled={doorDisabled}>
            {doorDisabled ? "Disabled" : "Active"}
          </StatusBadge>
        </CardHeader>

        <CardBody>
          <IconContainer>
            {doorDisabled ? (
              <Lock size={40} color="#a03333ff" />
            ) : (
              <Unlock size={40} color="#189f72ff" />
            )}
          </IconContainer>
          <h4>Manual Lock is {doorDisabled ? "Engaged" : "Disengaged"}</h4>
          <p>
            {doorDisabled
              ? "Physical access is currently restricted"
              : "Manual access is currently allowed"}
          </p>
        </CardBody>

        {message && (
          <MessageBox $type={message.$type}>
            {message.$type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
            {message.text}
          </MessageBox>
        )}

        <ActionButton
          onClick={handleToggle}
          disabled={loading}
          $disabled={doorDisabled}
        >
          {loading ? (
            <span>Processing...</span>
          ) : doorDisabled ? (
            <>
              <Unlock size={18} /> Enable Door Now
            </>
          ) : (
            <>
              <Lock size={18} /> Disable Door Now
            </>
          )}
        </ActionButton>
      </Card>
    </Container>
  );
}
