import { Button, ButtonText } from "@/components/ui/button";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { CalendarDaysIcon, ChevronDownIcon, Icon } from "@/components/ui/icon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth, db } from "@/firebase/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Spinner } from "@/components/ui/spinner";
import { HStack } from "@/components/ui/hstack";
import { X } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";

export default function ModalScreen() {
  const router = useRouter();
  const [showAPrioritySheet, setShowAPrioritySheet] = useState(false);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [priority, setPriority] = useState("");
  const [remindMe, setRemindMe] = useState("");
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePriorityClose = () => setShowAPrioritySheet(false);
  const handleReminderClose = () => setShowReminderSheet(false);

  const addTask = async () => {
    if (!task.trim() || !auth.currentUser) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        text: task,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: true,
        deadline: deadline || null,
        priority: priority || null,
        reminder: remindMe || null,
      });

      router.push("/todos");
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }

    setTask("");
    setDeadline("");
    setPriority("");
    setRemindMe("");
  };

  return (
    <>
      <View style={styles.container}>
        <HStack
          style={{
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <Pressable
            style={{ marginTop: 10 }}
            onPress={() => router.push("/todos")}
          >
            <HStack style={{ alignItems: "center" }} space="sm">
              <X size={25} strokeWidth={1} />
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Exit</Text>
            </HStack>
          </Pressable>

          <Button
            action="positive"
            style={styles.button}
            onPress={addTask}
            isDisabled={!task.trim()}
          >
            <ButtonText>
              {loading ? <Spinner size="small" color="white" /> : "Save"}
            </ButtonText>
          </Button>
        </HStack>

        <Text style={styles.label}>Add Task</Text>
        <TextInput
          placeholder="Add Task"
          value={task}
          onChangeText={setTask}
          autoCapitalize="sentences"
          style={styles.inputs}
        />

        <Text style={styles.label}>Set Date</Text>
        <Button
          variant="outline"
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "gray",
            height: 42,
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          onPress={() => setShowPicker(true)}
        >
          <ButtonText>
            {deadline ? (
              deadline
            ) : (
              <Text style={{ color: "gray", fontFamily: "sans-serif" }}>
                Set Deadline
              </Text>
            )}
          </ButtonText>
          <Icon as={CalendarDaysIcon} color="gray" />
        </Button>

        <Text style={styles.label}>Set Priority</Text>
        <Button
          variant="outline"
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "gray",
            height: 42,
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          onPress={() => setShowAPrioritySheet(true)}
        >
          <ButtonText>
            {priority ? (
              priority
            ) : (
              <Text style={{ color: "gray", fontFamily: "sans-serif" }}>
                Set Priority
              </Text>
            )}
          </ButtonText>
          <Icon as={ChevronDownIcon} color="gray" />
        </Button>

        <Text style={styles.label}>Remind Me</Text>
        <Button
          variant="outline"
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "gray",
            height: 42,
            justifyContent: "space-between",
            marginBottom: 15,
          }}
          onPress={() => setShowReminderSheet(true)}
        >
          <ButtonText>
            {remindMe ? (
              remindMe
            ) : (
              <Text style={{ color: "gray", fontFamily: "sans-serif" }}>
                Set a Reminder
              </Text>
            )}
          </ButtonText>
          <Icon as={ChevronDownIcon} color="gray" />
        </Button>
      </View>

      {showPicker && (
        <DateTimePicker
          value={deadline ? new Date(deadline) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (event.type === "dismissed") {
              setDeadline("");
            }
            if (event.type === "set") {
              if (selectedDate) {
                const formatted = selectedDate.toISOString().split("T")[0];
                setDeadline(formatted);
              }
            }
          }}
        />
      )}

      <Actionsheet isOpen={showAPrioritySheet} onClose={handlePriorityClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem
            onPress={() => {
              setPriority("Urgent");
              handlePriorityClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>Urgent</Text> -
              need immediate action
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              setPriority("Normal");
              handlePriorityClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>Normal</Text> -
              regular task
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              setPriority("Low");
              handlePriorityClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>Low</Text> -
              can be done later
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem></ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet isOpen={showReminderSheet} onClose={handleReminderClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem
            onPress={() => {
              setRemindMe("30 minutes");
              handleReminderClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                30 minutes
              </Text>{" "}
              before deadline
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              setRemindMe("1 hour");
              handleReminderClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>1 hour</Text>{" "}
              before deadline
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              setRemindMe("2 hours");
              handleReminderClose();
            }}
            style={{ paddingLeft: 70 }}
          >
            <ActionsheetItemText>
              <Text style={{ fontWeight: "bold", fontSize: 15 }}>2 hours</Text>{" "}
              before deadline
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem></ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 5,
    color: "black",
  },
  inputs: {
    borderWidth: 1,
    borderColor: "#0000005b",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#000000ff",
  },
  button: {
    marginTop: 10,
    height: 35,
    width: 80,
  },
});
