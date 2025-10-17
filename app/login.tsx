import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from "react-native";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { Center } from "@/components/ui/center";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from "@/components/ui/toast";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  CheckCircleIcon,
  CloseIcon,
  HelpCircleIcon,
  Icon,
} from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { BlurView } from "expo-blur";
import { ButtonText } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LinearGradient } from "expo-linear-gradient";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Input, InputField } from "@/components/ui/input";

interface Task {
  toastID: string;
  id: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [forgotPasswordEmail, setforgotPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // optional: show loading state
  const toastSuccess = useToast();
  const toastError = useToast();
  const toastMissingField = useToast();
  const [toastId, setToastId] = useState(0);
  const handleToastSuccess = () => {
    if (!toastSuccess.isActive(String(toastId))) {
      showNewToastSuccess();
    }
  };
  const handleToastError = (error: string) => {
    if (!toastError.isActive(String(toastId))) {
      showNewToastError(error);
    }
  };
  const handleToastMissingField = () => {
    if (!toastMissingField.isActive(String(toastId))) {
      showNewToastMissingField();
    }
  };

  const showNewToastSuccess = () => {
    const newId = Math.random();
    setToastId(newId);
    toastSuccess.show({
      id: String(newId),
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action="success"
            variant="solid"
            nativeID={uniqueToastId}
            style={{ zIndex: 9999 }}
          >
            <HStack space="md">
              <Icon as={CheckCircleIcon} color="white" />
              <VStack space="xs">
                <ToastTitle>Success!</ToastTitle>
                <ToastDescription size="sm">
                  You are now logged in!
                </ToastDescription>
              </VStack>
            </HStack>
          </Toast>
        );
      },
    });
  };

  const showNewToastError = (error: string) => {
    const newId = Math.random();
    setToastId(newId);
    toastError.show({
      id: String(newId),
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action="error"
            variant="outline"
            nativeID={uniqueToastId}
            className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between"
          >
            <HStack space="md">
              <Icon as={HelpCircleIcon} className="stroke-error-500 mt-0.5" />
              <VStack space="xs">
                <ToastTitle className="font-semibold text-error-500">
                  Error!
                </ToastTitle>
                <ToastDescription size="sm">{error}</ToastDescription>
              </VStack>
            </HStack>
          </Toast>
        );
      },
    });
  };

  const showNewToastMissingField = () => {
    const newId = Math.random();
    setToastId(newId);
    toastMissingField.show({
      id: String(newId),
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast
            action="error"
            variant="outline"
            nativeID={uniqueToastId}
            className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between"
          >
            <HStack space="md">
              <Icon as={HelpCircleIcon} className="stroke-error-500 mt-0.5" />
              <VStack space="xs">
                <ToastTitle className="font-semibold text-error-500">
                  Missing fields!
                </ToastTitle>
                <ToastDescription size="sm">
                  Please enter both email and password.
                </ToastDescription>
              </VStack>
            </HStack>
          </Toast>
        );
      },
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      handleToastMissingField();
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      handleToastSuccess();
      router.replace("/todos"); // 👈 Go to your main to-do page
    } catch (error: any) {
      handleToastError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      // Check if email exists
      const q = query(collection(db, "profile"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert("Error", "No account found with that email.");
        setEmail("");
        return null;
      }

      // Send reset email
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset",
        "We sent you an email with a link to reset your password."
      );
      setforgotPasswordEmail("");
      setShowModal(false);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      Alert.alert("Error", error.message);
    }
  };

  const [isPressed, setIsPressed] = useState(false);
  const [isCreateAccountPressed, setIsCreateAccountPressed] = useState(false);
  const [showModal, setShowModal] = React.useState(false);
  return (
    <LinearGradient
      colors={["#4796CD", "#C7E8FF"]} // 💜💙 your gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }} // ✅ fills entire screen
    >
      <Center style={{ flex: 1 }}>
        <Box
          style={{
            borderRadius: 12,
            borderWidth: 0,
            width: 320,
            backgroundColor: "white",
          }}
        >
          <View style={{ padding: 30, alignContent: "center" }}>
            <Center>
              {/* not needed center tag */}
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 25,
                  marginTop: 0,
                  color: "#000000ff",
                }}
              >
                Sign In
              </Text>
            </Center>

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.inputs}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onSubmitEditing={handleLogin}
              autoCapitalize="none"
              style={styles.inputs}
            />

            <Button
              onPress={handleLogin}
              disabled={loading}
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              style={{
                backgroundColor: isPressed || loading ? "#9cd6ffff" : "#C7E8FF",
                borderRadius: 4,
              }}
            >
              <ButtonText
                style={{
                  color: "black",
                  fontSize: 16,
                }}
              >
                {loading ? <Spinner size="small" color="white" /> : "Login"}
              </ButtonText>
            </Button>

            <Button
              onPress={() => setShowModal(true)}
              variant={"link"}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <ButtonText style={{ fontSize: 12, fontWeight: "bold" }}>
                Forgot Password?
              </ButtonText>
            </Button>

            <Divider orientation="horizontal" />

            <Button
              onPress={() => router.push("/register")}
              onPressIn={() => setIsCreateAccountPressed(true)}
              onPressOut={() => setIsCreateAccountPressed(false)}
              style={{
                backgroundColor: isCreateAccountPressed
                  ? "#ffd190ff"
                  : "#FFDDAE",
                borderRadius: 4,
                marginTop: 20,
              }}
            >
              <ButtonText
                style={{
                  color: "#000000ff",
                  fontSize: 16,
                }}
              >
                Create new account
              </ButtonText>
            </Button>
          </View>
        </Box>
      </Center>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Forgot Your Password?</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>Enter Your Email</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#0000005b",
                borderRadius: 8,
                padding: 10,
                color: "#000000ff",
                marginTop: 8,
              }}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="default"
              value={forgotPasswordEmail}
              onChangeText={setforgotPasswordEmail}
            />
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button
              onPress={handlePasswordReset}
              className="w-full"
              action="positive"
              size="lg"
            >
              <ButtonText>Submit</ButtonText>
            </Button>
            <Button
              onPress={() => {
                setShowModal(false);
                setforgotPasswordEmail("");
              }}
              className="w-full"
              action="negative"
              size="lg"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  content: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 24,
  },
  blurContainer: {
    width: 320,
    height: 340,
    borderRadius: 50,
    overflow: "hidden",
  },
  buttonFeedback: {
    backgroundColor: "gray",
  },
  inputs: {
    borderWidth: 1,
    borderColor: "#0000005b",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#000000ff",
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 5,
    color: "gray",
  },
});
