"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DoorOpen, AlertTriangle } from "lucide-react";

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

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const InfoBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: ${(props) => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  color: ${(props) => props.theme.colors.danger};
`;

const InfoText = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0;
`;

const DoorCard = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  margin-bottom: ${(props) => props.theme.spacing.md};
  box-shadow: ${(props) => props.theme.shadows.md};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${(props) => props.theme.shadows.lg};
  }

  @media (max-width: 600px) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const DoorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const DoorInfo = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: ${(props) => props.theme.spacing.xs};
  }

  p {
    font-size: 0.875rem;
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const StatusBadge = styled.span`
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.$disabled ? props.theme.colors.danger : props.theme.colors.success};
  color: white;
`;

const Section = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const DurationOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${(props) => props.theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DurationButton = styled.button`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) =>
    props.$selected ? props.theme.colors.text : props.theme.colors.background};
  color: ${(props) =>
    props.$selected ? props.theme.colors.background : props.theme.colors.text};
  border: 2px solid
    ${(props) =>
      props.$selected ? props.theme.colors.text : props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CustomDurationInput = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.background};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RestrictionsList = styled.div`
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
`;

const RestrictionItem = styled.div`
  display: flex;
  align-items: start;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textSecondary};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.xl};

  @media (max-width: 600px) {
    flex-direction: column;
    button {
      width: 100%;
    }
  }
`;

const DisableButton = styled.button`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  background: ${(props) => props.theme.colors.danger};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
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

const EnableButton = styled(DisableButton)`
  background: ${(props) => props.theme.colors.success};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  background: transparent;
  color: ${(props) => props.theme.colors.text};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.full};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.colors.background};
    transform: translateY(-2px);
  }
`;

const DisabledUntil = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.lg};
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${(props) => props.theme.colors.danger};
  border-radius: ${(props) => props.theme.borderRadius.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};

  p {
    font-size: 0.875rem;
    color: ${(props) => props.theme.colors.textSecondary};
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }

  .time {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${(props) => props.theme.colors.danger};
  }
`;

const MessageBox = styled.div`
  margin-top: ${(props) => props.theme.spacing.lg};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
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

export default function DisableDoorTemporarily() {
  const [selectedDuration, setSelectedDuration] = useState("1h");
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("hours");
  const [doorDisabled, setDoorDisabled] = useState(false);
  const [disabledUntil, setDisabledUntil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = "/api/disable-door";

  useEffect(() => {
    fetchDoorStatus();
  }, []);

  const fetchDoorStatus = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.disabled) {
        setDoorDisabled(true);
        setDisabledUntil(new Date(data.disabled_until));
      }
    } catch (error) {
      console.error("Failed to fetch door status:", error);
    }
  };

  const durations = [
    { value: "1h", label: "1 Hour" },
    { value: "3h", label: "3 Hours" },
    { value: "6h", label: "6 Hours" },
    { value: "12h", label: "12 Hours" },
    { value: "1d", label: "1 Day" },
    { value: "3d", label: "3 Days" },
    { value: "1w", label: "1 Week" },
    { value: "custom", label: "Custom" },
  ];

  const calculateDisabledUntil = (duration) => {
    const now = new Date();
    let minutes = 0;

    if (duration === "custom") {
      const value = parseInt(customValue);
      if (!value || value <= 0) return null;

      switch (customUnit) {
        case "minutes":
          minutes = value;
          break;
        case "hours":
          minutes = value * 60;
          break;
        case "days":
          minutes = value * 60 * 24;
          break;
      }
    } else {
      const match = duration.match(/(\d+)([hdw])/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
          case "h":
            minutes = value * 60;
            break;
          case "d":
            minutes = value * 60 * 24;
            break;
          case "w":
            minutes = value * 60 * 24 * 7;
            break;
        }
      }
    }

    if (minutes === 0) return null;

    const until = new Date(now.getTime() + minutes * 60000);
    return until;
  };

  const handleDisable = async () => {
    const until = calculateDisabledUntil(selectedDuration);
    if (!until) {
      setMessage({ text: "Please enter a valid duration", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disable",
          duration_minutes: Math.floor((until - new Date()) / 60000),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDisabledUntil(until);
        setDoorDisabled(true);
        setMessage({ text: "Door disabled successfully", type: "success" });
      } else {
        setMessage({
          text: data.detail || "Failed to disable door",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Failed to connect to door system", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enable",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDoorDisabled(false);
        setDisabledUntil(null);
        setSelectedDuration("1h");
        setCustomValue("");
        setMessage({ text: "Door enabled successfully", type: "success" });
      } else {
        setMessage({
          text: data.detail || "Failed to enable door",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({ text: "Failed to connect to door system", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <Header>
        <Logo>
          <DoorOpen /> SmartDoor
        </Logo>
      </Header>

      <Title>Disable Door Temporarily</Title>
      <Subtitle>Temporarily restrict all access to your door</Subtitle>

      <ContentWrapper>
        <InfoBox>
          <AlertTriangle
            size={20}
            style={{ marginTop: "2px", color: "#ef4444", flexShrink: 0 }}
          />
          <InfoContent>
            <InfoTitle>What happens when disabled?</InfoTitle>
            <InfoText>
              When disabled, all unlock attempts will fail, PIN changes will be
              blocked, and remote access will be restricted until the specified
              time expires.
            </InfoText>
          </InfoContent>
        </InfoBox>

        <DoorCard>
          <DoorHeader>
            <DoorInfo>
              <h3>Front Door</h3>
              <p>Main Entrance</p>
            </DoorInfo>
            <StatusBadge $disabled={doorDisabled}>
              {doorDisabled ? "🚫 Disabled" : "✓ Active"}
            </StatusBadge>
          </DoorHeader>

          {doorDisabled && disabledUntil && (
            <DisabledUntil>
              <p>Door disabled until:</p>
              <div className="time">{formatDateTime(disabledUntil)}</div>
            </DisabledUntil>
          )}

          {!doorDisabled && (
            <>
              <Section>
                <SectionTitle>Select Duration</SectionTitle>
                <DurationOptions>
                  {durations.map((duration) => (
                    <DurationButton
                      key={duration.value}
                      $selected={selectedDuration === duration.value}
                      onClick={() => setSelectedDuration(duration.value)}
                    >
                      {duration.label}
                    </DurationButton>
                  ))}
                </DurationOptions>

                {selectedDuration === "custom" && (
                  <CustomDurationInput>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter value"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                    />
                    <Select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </Select>
                  </CustomDurationInput>
                )}
              </Section>

              <Section>
                <SectionTitle>Restrictions During Disable Period</SectionTitle>
                <RestrictionsList>
                  <RestrictionItem>
                    <span>🔒</span>
                    <span>All unlock attempts will be blocked</span>
                  </RestrictionItem>
                  <RestrictionItem>
                    <span>🔢</span>
                    <span>PIN changes will not be allowed</span>
                  </RestrictionItem>
                  <RestrictionItem>
                    <span>📱</span>
                    <span>Remote access will be restricted</span>
                  </RestrictionItem>
                  <RestrictionItem>
                    <span>👥</span>
                    <span>Guest access will be suspended</span>
                  </RestrictionItem>
                  <RestrictionItem>
                    <span>⏰</span>
                    <span>Scheduled access will be paused</span>
                  </RestrictionItem>
                </RestrictionsList>
              </Section>
            </>
          )}

          {message && (
            <MessageBox type={message.type}>{message.text}</MessageBox>
          )}
        </DoorCard>

        <ActionButtons>
          {doorDisabled ? (
            <EnableButton onClick={handleEnable} disabled={loading}>
              {loading ? "Enabling..." : "✓ Enable Door Now"}
            </EnableButton>
          ) : (
            <>
              <CancelButton onClick={() => window.history.back()}>
                Cancel
              </CancelButton>
              <DisableButton onClick={handleDisable} disabled={loading}>
                {loading ? "Disabling..." : "🚫 Disable Door"}
              </DisableButton>
            </>
          )}
        </ActionButtons>
      </ContentWrapper>
    </Container>
  );
}
