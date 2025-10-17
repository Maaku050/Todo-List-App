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
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
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
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { CheckCircleIcon, HelpCircleIcon, Icon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { BlurView } from "expo-blur";
import { ButtonText } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  uid: string;
  createdAt?: any;
  status: boolean;
  deadline?: string | null;
  toastID: string;
}

export default function forgotPasswordScreen() {
  const route = useRouter();
  const [email, setEmail] = useState("");

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
      route.replace("/login");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/login_background3.jpg")} // ✅ local image in your project
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Center>
          <Text style={styles.title}>Forgot your password?</Text>
        </Center>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="default"
          value={email}
          onChangeText={setEmail}
        />

        <Button onPress={handlePasswordReset}>
          <ButtonText>Submit</ButtonText>
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 100,
    alignContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ffffff5b",
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    color: "#000000ff",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
});
