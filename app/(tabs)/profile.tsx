import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  Pressable,
} from "react-native";
import { router, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
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
import { Link } from "expo-router";
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
  const [editProfile, setEditProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const router = useRouter();
  const toast = useToast();
  const [toastId, setToastId] = useState(0);
  const handleToast = () => {
    if (!toast.isActive(String(toastId))) {
      showNewToast();
    }
  };
  const delayedLogout = async () => {
    handleToast();
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  };

  const handleLogout = async () => {
    await signOut(auth);

    router.replace("/login");
  };

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

  const handleEditProfile = () => {
    setEditProfile(true);
    setEditMode(true);
  };

  const editTask = async (id: string, field: string, newText: string) => {
    if (!newText.trim()) return;
    await updateDoc(doc(db, "profile", id), { [field]: newText });
  };

  const { user, profile, tasks, fetchLoading } = useUser();

  if (!user || !profile?.length) {
    return (
      <Center>
        <Text>Loading...</Text>
      </Center>
    );
  }

  if (fetchLoading) {
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
        }}
      >
        <Box
          style={{
            borderWidth: 0,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 35,
            paddingBottom: 25,
          }}
        >
          <Avatar size="2xl">
            <AvatarFallbackText>{profile[0].firstName}</AvatarFallbackText>
            {/* <AvatarImage
              source={{
                uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
              }}
            /> */}
            <AvatarBadge />
          </Avatar>

          <View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                fontFamily: "sans-serif-light",
              }}
            >
              {profile[0].firstName} {profile[0].lastName}
            </Text>
          </View>
        </Box>

        <Box
          style={{ backgroundColor: "white", padding: 10, borderRadius: 20 }}
        >
          <HStack style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Email:</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {profile[0].email ? profile[0].email : ""}
              </Text>
            </View>
          </HStack>

          <HStack style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>First Name:</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {profile[0].firstName ? profile[0].firstName : ""}
              </Text>
            </View>
          </HStack>

          <HStack style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Last Name:</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {profile[0].lastName ? profile[0].lastName : ""}
              </Text>
            </View>
          </HStack>

          <HStack style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Age:</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {profile[0].age ? profile[0].age : "No age yet"}
              </Text>
            </View>
          </HStack>

          <HStack style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Address:</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>
                {profile[0].address ? profile[0].address : "No address yet"}
              </Text>
            </View>
          </HStack>
        </Box>

        <Button
          style={styles.button}
          action="positive"
          onPress={() => setShowEditModal(true)}
        >
          <ButtonText>Edit Profile</ButtonText>
        </Button>

        <Divider
          orientation="horizontal"
          style={{
            backgroundColor: "#aaaaaaff",
          }}
        />

        <Button
          style={styles.button}
          action="negative"
          onPress={() => setShowLogoutModal(true)}
        >
          <ButtonText>Log out</ButtonText>
        </Button>
      </View>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Edit Profile</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text>Are you sure you want to edit profile?</Text>
          </ModalBody>
          <ModalFooter className="flex-col items-start">
            <Button
              className="w-full"
              action="positive"
              size="lg"
              onPress={() => router.push("/editModal")}
            >
              <ButtonText>Yes</ButtonText>
            </Button>

            <Button
              onPress={() => {
                setShowEditModal(false);
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

      <Modal
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
      </Modal>
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
    borderColor: "transparent",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000ff",
    backgroundColor: "transparent",
    textAlign: "right", // 👈 optional, makes it align neatly
    flexShrink: 1, // prevents overflow
    maxWidth: "60%", // optional, helps control width
  },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  labelContainer: {
    width: 110, // 👈 fixed width keeps all labels aligned
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  valueContainer: {
    flex: 1,
    alignItems: "flex-start", // 👈 pushes value text to the far right
    borderWidth: 0,
  },
  value: {
    fontSize: 14,
    color: "#000",
    flexShrink: 1,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    height: 45,
  },
});
