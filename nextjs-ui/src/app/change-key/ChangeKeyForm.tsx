"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { DoorOpen, Lock, KeyRound, AlertCircle } from "lucide-react";

interface Message {
  text: string;
  type: "success" | "error";
  detail?: string;
}
interface ChangeKeyFormProps {
  initialPinExists: boolean;
}

interface MessageBoxProps {
  type: "success" | "error";
}

const Container = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  padding: ${(props) => props.theme.spacing.xl};
  transition: all 0.3s ease;
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
  font-size: 1.5rem;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const FormContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const FormCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  box-shadow: ${(props) => props.theme.shadows.md};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${(props) => props.theme.shadows.lg};
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  padding-left: ${(props) => props.theme.spacing.xl};
  background: ${(props) => props.theme.colors.background};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.text};
    background: ${(props) => props.theme.colors.surface};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${(props) => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
`;

const SubmitButton = styled.button`
  background: ${(props) => props.theme.colors.text};
  color: ${(props) => props.theme.colors.background};
  border: none;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  transition: all 0.3s ease;
  font-size: 1rem;
  margin-top: ${(props) => props.theme.spacing.md};

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
  }
`;

const MessageBox = styled.div<MessageBoxProps>`
  margin-top: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  background: ${(props) =>
    props.type === "success"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(239, 68, 68, 0.1)"};
  color: ${(props) =>
    props.type === "success"
      ? props.theme.colors.success
      : props.theme.colors.danger};
  border: 1px solid
    ${(props) =>
      props.type === "success"
        ? props.theme.colors.success
        : props.theme.colors.danger};
  animation: slideIn 0.3s ease forwards;
  display: flex;
  align-items: flex-start;
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

const MessageContent = styled.div`
  flex: 1;
`;

const MessageTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const MessageDetail = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0;
`;

export default function ChangeKeyForm({
  initialPinExists,
}: ChangeKeyFormProps) {
  const [oldKey, setOldKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [pinExists, setPinExists] = useState(initialPinExists);

  const handleInitializePin = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/initialize-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: newKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "PIN initialized successfully!",
          type: "success",
        });
        setNewKey("");
      }
      // ✅ Detect conflict and switch to Change PIN UI
      else if (response.status === 409) {
        setMessage({
          text:
            data.message ||
            "A PIN already exists. Please change your PIN instead.",
          detail: "Status: 409 (Conflict)",
          type: "error",
        });

        // 👇 This makes the page switch from "Set Up Your PIN" → "Change Your PIN"
        setPinExists(true);
      } else {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : data.message || data.error || "Failed to initialize PIN";

        setMessage({
          text: errorMessage,
          detail: `Status: ${response.status}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      setMessage({
        text: "Failed to connect to door system",
        detail: "Please check your internet connection or try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeKey = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/change-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_key: oldKey,
          new_key: newKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || "PIN changed successfully!",
          type: "success",
        });
        setOldKey("");
        setNewKey("");
      } else {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : data.message || data.error || "Failed to change PIN";

        setMessage({
          text: errorMessage,
          detail: `Status: ${response.status}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      setMessage({
        text: "Failed to connect to door system",
        detail:
          "Please check your internet connection or try again later. The server may be temporarily unavailable.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Logo>
          <DoorOpen /> SmartDoor
        </Logo>
      </Header>

      <Title>{pinExists ? "Change Your PIN" : "Set Up Your PIN"}</Title>
      <Subtitle>
        {pinExists
          ? "Update your door lock PIN to keep your home secure"
          : "Create your first PIN to secure your smart door"}
      </Subtitle>

      <FormContainer>
        <InfoBox>
          <InfoText>
            {pinExists
              ? "Enter your current PIN and choose a new one. Make sure to remember your new PIN as it will be required to unlock your door."
              : "Choose a 4-digit PIN that you'll remember. This will be required to unlock your door."}
          </InfoText>
        </InfoBox>

        <FormCard>
          <FormContent>
            {pinExists && (
              <InputGroup>
                <Label>
                  <Lock size={16} />
                  Current PIN
                </Label>
                <InputWrapper>
                  <InputIcon>
                    <KeyRound size={18} />
                  </InputIcon>
                  <Input
                    type="password"
                    value={oldKey}
                    onChange={(e) =>
                      setOldKey(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter current PIN"
                    maxLength={4}
                  />
                </InputWrapper>
              </InputGroup>
            )}

            <InputGroup>
              <Label>
                <Lock size={16} />
                {pinExists ? "New PIN" : "Your PIN"}
              </Label>
              <InputWrapper>
                <InputIcon>
                  <KeyRound size={18} />
                </InputIcon>
                <Input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.replace(/\D/g, ""))}
                  placeholder={
                    pinExists ? "Enter new PIN" : "Enter 4-digit PIN"
                  }
                  maxLength={4}
                />
              </InputWrapper>
            </InputGroup>

            <SubmitButton
              onClick={pinExists ? handleChangeKey : handleInitializePin}
              disabled={
                loading ||
                newKey.length !== 4 ||
                (pinExists === true && oldKey.length !== 4)
              }
            >
              {loading
                ? pinExists
                  ? "Updating PIN..."
                  : "Setting PIN..."
                : pinExists
                ? "Update PIN"
                : "Set PIN"}
              {!loading && <span>→</span>}
            </SubmitButton>
          </FormContent>

          {message && (
            <MessageBox type={message.type}>
              <AlertCircle
                size={18}
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <MessageContent>
                <MessageTitle>{message.text}</MessageTitle>
                {message.detail && (
                  <MessageDetail>{message.detail}</MessageDetail>
                )}
              </MessageContent>
            </MessageBox>
          )}
        </FormCard>
      </FormContainer>
    </Container>
  );
}
