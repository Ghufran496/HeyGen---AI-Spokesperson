import type { StartAvatarResponse } from "@heygen/streaming-avatar";

import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, usePrevious } from "ahooks";

import SurveyAvatarTextInput from "./SurveyAvatarTextInput";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

const questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down?",
  "Trouble concentrating on things, such as reading the newspaper or watching television?",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
  "Thoughts that you would be better off dead or of hurting yourself in some way?",
];

export default function SurveyAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [avatarId, setAvatarId] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");

  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [responses, setResponses] = useState<string[]>([]);
  const [text, setText] = useState<string>("");

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      return await response.text();
    } catch (error) {
      console.error("Error fetching access token:", error);
      return "";
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    const token = await fetchAccessToken();
  
    avatar.current = new StreamingAvatar({ token });
  
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, () =>
      setIsUserTalking(true)
    );
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () =>
      setIsUserTalking(false)
    );
    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("Stream ready event triggered:", event.detail);
      setStream(event.detail);
    });
  
    try {
      const avatarName = avatarId || "Anna_public_3_20240108"; // Fallback to default if ID is empty
      await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName,
        language,
        voice: { rate: 1.2, emotion: VoiceEmotion.EXCITED },
      });
  
      await avatar.current.speak({
        text: "Hello, I am here to guide you through the Personal Health Questionnaire. Are you ready to begin? Please answer in Yes or No.",
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
      setCurrentQuestionIndex(0); // Prepare for the first question
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }
  

  async function handleResponse(userResponse: string) {
    if (currentQuestionIndex === -1) return;

    if (
      currentQuestionIndex === 0 &&
      userResponse.toLowerCase().includes("yes")
    ) {
      await askNextQuestion();
    } else if (currentQuestionIndex > 0) {
      // Save response and move to the next question
      saveResponse(userResponse);
      await askNextQuestion();
    }
  }

  async function askNextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const question = questions[nextIndex];
      await avatar.current?.speak({
        text: question,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
    } else {
      await avatar.current?.speak({
        text: "Thank you for completing the survey.",
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
      setCurrentQuestionIndex(-1);
    }
  }

  async function saveResponse(response: string) {
    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    try {
      await fetch("/api/savesurvey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "defaultUser", // Replace with actual user identification
          responses: updatedResponses.map((res, index) => ({
            question: questions[index],
            answer: res,
          })),
        }),
      });
    } catch (error) {
      console.error("Error saving survey response:", error);
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Card>
        <CardBody>
          {stream ? (
            <video
            ref={mediaStream}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          >
            <track kind="captions" />
          </video>
          ) : isLoadingSession ? (
            <Spinner size="lg" />
          ) : (
            <div>
              <Input
                placeholder="Enter Avatar ID"
                value={avatarId}
                onChange={(e) => setAvatarId(e.target.value)}
              />
              <Select onChange={(e) => setLanguage(e.target.value)}>
                {STT_LANGUAGE_LIST.map((lang) => (
                  <SelectItem key={lang.key}>{lang.label}</SelectItem>
                ))}
              </Select>
              <Button onClick={startSession}>Start Session</Button>
            </div>
          )}
        </CardBody>
        <Divider />
        <CardFooter>
          <Tabs
            selectedKey={chatMode}
            onSelectionChange={(key: any) => setChatMode(key)}
          >
            <Tab key="text_mode" title="Text Mode" />
            <Tab key="voice_mode" title="Voice Mode" />
          </Tabs>
          <SurveyAvatarTextInput
            input={text}
            setInput={setText}
            onSubmit={() => handleResponse(text)}
          />
        </CardFooter>
      </Card>
    </div>
  );
}


// "use client";

// import SurveyAvatar from "@/components/SurveyAvatar";

// export default function Suvery() {

//   return (
//     <div className="w-screen h-screen flex flex-col">
//       <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
//         <div className="w-full">
//           <SurveyAvatar />
//         </div>
//       </div>
//     </div>
//   );
// }