import { useColors } from "@/hooks/useColors";
import { useVoice } from "@/hooks/useVoice";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  "How can I reduce my energy bill?",
  "Turn off bedroom lights",
  "What's using the most power?",
  "Set thermostat to 21°C",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "assistant",
    content:
      "Hi! I'm Aura, your energy assistant. I can help you control devices, understand your usage, and find ways to save. What would you like to do?",
    timestamp: new Date(Date.now() - 60000),
  },
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "I've analyzed your home's energy data. Based on current usage patterns, your top opportunity is shifting laundry and EV charging to off-peak hours after 9 PM, which could save you around £32 this month.",
  bill: "Your estimated bill for this month is £85 — that's £10 lower than last month. Your peak usage is 12–6 PM. Shifting 2 heavy appliances could save another £18.",
  thermostat:
    "Done! Thermostat set to 19°C. At your current tariff rates, this change saves approximately £0.33 per day compared to 21°C.",
  lights:
    "Turning off bedroom lights now. They were consuming 40W — that's 0.04 kWh per hour saved.",
  power:
    "Your top consumers right now: AC Unit (1.5 kW), Thermostat (1.2 kW), Refrigerator (0.15 kW). The AC is using 53% of your current draw.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("bill") || lower.includes("reduce") || lower.includes("save"))
    return AI_RESPONSES.bill;
  if (lower.includes("thermostat") || lower.includes("temperature") || lower.includes("21"))
    return AI_RESPONSES.thermostat;
  if (lower.includes("light") || lower.includes("bedroom"))
    return AI_RESPONSES.lights;
  if (lower.includes("power") || lower.includes("using") || lower.includes("most"))
    return AI_RESPONSES.power;
  return AI_RESPONSES.default;
}

function MessageBubble({ message }: { message: Message }) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View
      style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}
    >
      {!isUser && (
        <View
          style={[styles.botAvatar, { backgroundColor: colors.primary + "25" }]}
        >
          <Ionicons name="flash" size={14} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubbleContent,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderColor: isUser ? colors.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            {
              color: isUser ? colors.primaryForeground : colors.foreground,
              fontFamily: "Inter_400Regular",
            },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function AuraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Voice: speech-to-text fills/sends the message, text-to-speech reads replies.
  // sendMessageRef lets the voice callbacks reach the latest sendMessage without
  // a declaration-order cycle.
  const sendMessageRef = useRef<(text: string) => void>(() => {});
  const voice = useVoice({
    onPartialTranscript: (t) => setInput(t),
    onFinalTranscript: (t) => {
      setInput("");
      sendMessageRef.current(t);
    },
  });

  // Pulse the mic button while it is listening.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!voice.isListening) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [voice.isListening, pulse]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [aiMsg, ...prev]);
      setIsTyping(false);
      if (voice.voiceRepliesOn) {
        voice.speak(aiMsg.content);
      }
    }, 1000 + Math.random() * 500);
  };

  sendMessageRef.current = sendMessage;

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  const handleToggleVoiceReplies = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    voice.toggleVoiceReplies();
  };

  const statusLabel = voice.isListening
    ? "Listening..."
    : voice.isSpeaking
      ? "Speaking..."
      : isTyping
        ? "Thinking..."
        : "Online";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            paddingTop: topPad + 12,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View
            style={[styles.auraIcon, { backgroundColor: colors.primary + "20" }]}
          >
            <Ionicons name="flash" size={16} color={colors.primary} />
          </View>
          <View>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Aura AI
            </Text>
            <Text
              style={[
                styles.headerSub,
                {
                  color: colors.primary,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleToggleVoiceReplies}
          accessibilityRole="button"
          accessibilityLabel={
            voice.voiceRepliesOn ? "Turn off read aloud" : "Turn on read aloud"
          }
          style={[
            styles.speakerBtn,
            voice.voiceRepliesOn && { backgroundColor: colors.primary + "20" },
          ]}
        >
          <Ionicons
            name={voice.voiceRepliesOn ? "volume-high" : "volume-mute"}
            size={20}
            color={
              voice.voiceRepliesOn ? colors.primary : colors.mutedForeground
            }
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        inverted
        contentContainerStyle={styles.messagesList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!!messages.length}
        ListHeaderComponent={
          isTyping ? (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <View
                style={[
                  styles.botAvatar,
                  { backgroundColor: colors.primary + "25" },
                ]}
              >
                <Ionicons name="flash" size={14} color={colors.primary} />
              </View>
              <View
                style={[
                  styles.bubbleContent,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    {
                      color: colors.mutedForeground,
                      fontFamily: "Inter_400Regular",
                    },
                  ]}
                >
                  ...
                </Text>
              </View>
            </View>
          ) : null
        }
      />

      {messages.length === 1 && (
        <View style={styles.prompts}>
          {SAMPLE_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              onPress={() => sendMessage(prompt)}
              style={[
                styles.promptChip,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.promptText,
                  {
                    color: colors.foreground,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
          },
        ]}
      >
        {voice.supportsSTT && (
          <Animated.View style={{ opacity: voice.isListening ? pulse : 1 }}>
            <TouchableOpacity
              onPress={handleMicPress}
              accessibilityRole="button"
              accessibilityLabel={
                voice.isListening ? "Stop listening" : "Speak to Aura"
              }
              style={[
                styles.micBtn,
                {
                  backgroundColor: voice.isListening
                    ? colors.destructive
                    : colors.background,
                  borderColor: voice.isListening
                    ? colors.destructive
                    : colors.border,
                },
              ]}
            >
              <Ionicons
                name={voice.isListening ? "mic" : "mic-outline"}
                size={20}
                color={voice.isListening ? "#FFFFFF" : colors.mutedForeground}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.foreground,
              borderColor: colors.border,
              fontFamily: "Inter_400Regular",
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={
            voice.isListening ? "Listening..." : "Ask Aura anything..."
          }
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => sendMessage(input)}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          onPress={() => sendMessage(input)}
          disabled={!input.trim()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: input.trim() ? colors.primary : colors.muted,
            },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={input.trim() ? colors.primaryForeground : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  auraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16 },
  headerSub: { fontSize: 12 },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  bubble: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  bubbleUser: { justifyContent: "flex-end" },
  bubbleBot: { justifyContent: "flex-start" },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubbleContent: {
    maxWidth: "78%",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  prompts: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  promptChip: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  promptText: { fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  speakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
