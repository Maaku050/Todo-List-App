import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { Center } from "@/components/ui/center";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  CheckCircleIcon,
  CloseIcon,
  EditIcon,
  HelpCircleIcon,
  Icon,
} from "@/components/ui/icon";
import { ButtonIcon, ButtonText } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { ChevronLeft } from "lucide-react-native";
import { useUser } from "@/context/userContext";

interface Task {
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  email: string;
  id: string;
  text: string;
  uid: string;
  createdAt?: any;
  status: boolean;
  deadline?: string | null;
  toastID: string;
}

export default function profileScreen() {
  const [profileInfo, setProfileInfo] = useState<Task[]>([]);
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState("");
  const toastMissingField = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { user, profile, tasks, fetchLoading } = useUser();

  const router = useRouter();
  const toast = useToast();
  const [toastId, setToastId] = useState(0);
  const handleToast = () => {
    if (!toast.isActive(String(toastId))) {
      showNewToast();
    }
  };

  const handleToastMissingField = () => {
    if (!toastMissingField.isActive(String(toastId))) {
      showNewToastMissingField();
    }
  };

  useEffect(() => {
    if (profile && profile.length > 0 && profile[0]) {
      const userData = profile[0];
      setFirstname(userData.firstName || "");
      setLastName(userData.lastName || "");
      setAge(String(userData.age || ""));
      setAddress(userData.address || "");
      setUserID(userData.id || "");
      setEmail(userData.email || "");
    }
  }, [profile]);

  const showNewToast = () => {
    const newId = Math.random();
    setToastId(newId);
    toast.show({
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
                <ToastDescription size="sm">
                  Something went wrong.
                </ToastDescription>
              </VStack>
            </HStack>
            <HStack className="min-[450px]:gap-3 gap-1">
              <Pressable onPress={() => toast.close(id)}>
                <Icon as={CloseIcon} />
              </Pressable>
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
                  First Name and Last Name fields required.
                </ToastDescription>
              </VStack>
            </HStack>
          </Toast>
        );
      },
    });
  };

  const editProfile = async (id: string) => {
    if (!firstName.trim() || !lastName.trim()) {
      handleToastMissingField();
      return;
    }
    await updateDoc(doc(db, "profile", id), {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: age.trim(),
      address: address.trim(),
    });

    router.replace("/profile");
  };

  if (!profile || profile.length === 0) {
    return (
      <Center>
        <Spinner size="large" color="gray" />
        <Text>Loading profile...</Text>
      </Center>
    );
  }

  return (
    <>
      <View
        style={{
          flex: 1,
          padding: 25,
          backgroundColor: "#C7E8FF",
          borderWidth: 0,
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => router.replace("/profile")}
          style={{ position: "absolute", top: 75, left: 20 }}
        >
          <Box
            style={{
              borderWidth: 0,
            }}
          >
            <HStack style={{ alignItems: "center" }}>
              <ChevronLeft size={30} strokeWidth={2} />
              <Text style={{ fontSize: 20 }}>Back</Text>
            </HStack>
          </Box>
        </Pressable>
        <View
          style={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 20,
          }}
        >
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="First Name"
            editable={false}
            style={{
              borderWidth: 1,
              borderColor: "#00000080",
              borderRadius: 8,
              padding: 10,
              marginBottom: 15,
              color: "#000000ff",
              backgroundColor: "white",
              paddingHorizontal: 16,
              opacity: 0.5,
            }}
            defaultValue={email}
          />

          <Text style={styles.label}>First Name</Text>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstname}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="Age"
            keyboardType="numeric"
            style={styles.input}
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            placeholder="Address"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />
        </View>
        <Button
          style={styles.button}
          action="positive"
          onPress={() => setShowConfirmModal(true)}
        >
          <ButtonText>Save Changes</ButtonText>
        </Button>
      </View>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Confirmation</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to save the changes?</Text>
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button
              className="w-full"
              action="positive"
              size="lg"
              onPress={() => editProfile(userID)}
            >
              <ButtonText>Yes</ButtonText>
            </Button>

            <Button
              onPress={() => {
                setShowConfirmModal(false);
              }}
              className="w-full"
              action="negative"
              size="lg"
            >
              <ButtonText>No</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* <Modal
        isOpen={showLogoutModal}
        onClose={() => {
          setShowLogoutModal(false);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Logout?</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to log out?</Text>
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button
              onPress={handleLogout}
              className="w-full"
              action="positive"
              size="lg"
            >
              <ButtonText>Yes</ButtonText>
            </Button>
            <Button
              onPress={() => {
                setShowLogoutModal(false);
              }}
              className="w-full"
              action="negative"
              size="lg"
            >
              <ButtonText>No</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal> */}
    </>
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
    borderColor: "#00000080",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#000000ff",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  button: {
    marginTop: 15,
    marginBottom: 10,
    height: 40,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: "black",
  },
});
