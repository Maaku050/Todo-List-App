import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
} from "@/components/ui/checkbox";
import { AddIcon, CheckIcon, MenuIcon, TrashIcon } from "@/components/ui/icon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Center } from "@/components/ui/center";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Icon, CloseIcon, CalendarDaysIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ImageBackground } from "@/components/ui/image-background";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Clock } from "lucide-react-native";
import { useUser } from "@/context/userContext";

// interface Task {
//   id: string;
//   text: string;
//   uid: string;
//   createdAt?: any;
//   status: boolean;
//   deadline?: string | null;
//   toastID: string;
//   firstName: String;
//   priority: String | null;
//   reminder: String | null;
// }

export default function TodosScreen() {
  const router = useRouter();
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [filterButton, setFilterButton] = useState<boolean>(false);
  const [filter, setFilter] = useState("");

  // ➕ Add task
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
      });
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }

    setTask("");
    setDeadline("");
  };

  // 🗑️ Delete task
  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  // ✏️ Edit task
  const editTask = async (id: string, newText: string) => {
    if (!newText.trim()) return;
    await updateDoc(doc(db, "tasks", id), { text: newText });
  };

  const { user, profile, tasks, fetchLoading } = useUser();

  const activeTasks = tasks.filter(
    (t) => t.status === true && (filter === "" || t.priority === filter)
  );

  const completedTasks = tasks.filter(
    (t) => t.status === false && (filter === "" || t.priority === filter)
  );

  const [showModal, setShowModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
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

      <ImageBackground
        source={require("@/assets/images/Rectangle_152x.png")}
        style={{ height: 250 }}
        resizeMode="stretch"
      >
        <View
          style={{
            borderWidth: 0,
            height: 250,
            paddingLeft: 15,
            paddingRight: 15,
          }}
        >
          <VStack>
            <Text style={styles.title}>
              Hello,{" "}
              {profile?.[0]?.firstName || <Spinner size="large" color="blue" />}
            </Text>
            <Text style={{ color: "#000000ff", fontSize: 16 }}>
              Ready to be productive today?
            </Text>
          </VStack>

          <View style={{ marginTop: 35, paddingLeft: 15, paddingRight: 15 }}>
            <Center>
              <Text style={{ fontSize: 17, marginBottom: 10 }}>
                {completedTasks.length} out of{" "}
                {activeTasks.length + completedTasks.length} has been completed
              </Text>
            </Center>

            <Progress
              value={
                (completedTasks.length /
                  (activeTasks.length + completedTasks.length)) *
                100
              }
              size="sm"
              orientation="horizontal"
            >
              <ProgressFilledTrack />
            </Progress>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.container}>
        <Box style={{ borderWidth: 0 }}>
          <HStack
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              paddingVertical: 20,
            }}
          >
            {/* Left side — Title */}
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>To-Do-List</Text>

            {/* Right side — Menu */}
            <Menu
              onOpen={() => setFilterButton(true)}
              onClose={() => setFilterButton(false)}
              offset={5}
              trigger={({ ...triggerProps }) => {
                return (
                  <Button
                    {...triggerProps}
                    size="sm"
                    variant="outline"
                    style={{ borderWidth: 0 }}
                  >
                    {filterButton ? (
                      <ButtonIcon as={CloseIcon} />
                    ) : (
                      <>
                        <ButtonIcon as={MenuIcon} />
                        <ButtonText>{filter ? filter : "Filter"}</ButtonText>
                      </>
                    )}
                  </Button>
                );
              }}
            >
              <MenuItem
                key="Urgent"
                textValue="Urgent"
                className="p-2"
                onPress={() => setFilter("Urgent")}
              >
                <MenuItemLabel size="sm">Urgent</MenuItemLabel>
              </MenuItem>

              <MenuItem
                key="Normal"
                textValue="Normal"
                className="p-2"
                onPress={() => setFilter("Normal")}
              >
                <MenuItemLabel size="sm">Normal</MenuItemLabel>
              </MenuItem>

              <MenuItem
                key="Low"
                textValue="Low"
                className="p-2"
                onPress={() => setFilter("Low")}
              >
                <MenuItemLabel size="sm">Low</MenuItemLabel>
              </MenuItem>

              <MenuSeparator />

              <MenuItem
                key="Clear"
                textValue="Clear"
                className="p-2"
                onPress={() => setFilter("")}
              >
                <MenuItemLabel
                  size="sm"
                  style={{ textAlign: "center", width: 200 }}
                >
                  Clear
                </MenuItemLabel>
              </MenuItem>
            </Menu>
          </HStack>
        </Box>

        <Box
          style={{
            borderWidth: 0,
            marginLeft: 0,
            paddingLeft: 20,
            paddingRight: 20,
            maxHeight: 440,
            paddingBottom: 50,
          }}
        >
          {tasks.length === 0 ? (
            <Spinner size="large" color="blue" />
          ) : activeTasks.length > 0 || completedTasks.length > 0 ? (
            <>
              <ScrollView>
                {activeTasks.length == 0 ? (
                  ""
                ) : (
                  <Text style={{ fontSize: 15, marginBottom: 10 }}>
                    To Be Completed
                  </Text>
                )}

                {activeTasks.map((t) => (
                  <View key={t.id}>
                    <Center>
                      <Card
                        size="lg"
                        className="p-5 w-full m-1"
                        style={{ borderRadius: 20, borderWidth: 1 }}
                      >
                        <HStack style={{ alignItems: "center" }} space="md">
                          {/* 🟩 Section 1 */}
                          <Checkbox
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            isChecked={!t.status}
                            onChange={() =>
                              updateDoc(doc(db, "tasks", t.id), {
                                status: !t.status,
                              })
                            }
                            value={t.id}
                            accessibilityLabel={t.text ? String(t.text) : ""}
                          >
                            <CheckboxIndicator>
                              <CheckboxIcon as={CheckIcon} />
                            </CheckboxIndicator>
                          </Checkbox>

                          <Divider orientation="vertical" />

                          {/* 🟨 Section 2 */}
                          <VStack style={{ flex: 1 }}>
                            <Heading>
                              {t.priority ? (
                                <TextInput
                                  style={{
                                    flexWrap: "wrap",
                                    borderWidth: 0,
                                    padding: 4,
                                    fontSize: 14,
                                    color:
                                      t.priority && t.priority == "Urgent"
                                        ? "red"
                                        : t.priority && t.priority == "Normal"
                                        ? "blue"
                                        : t.priority && t.priority == "Low"
                                        ? "green"
                                        : "",
                                  }}
                                  editable={false}
                                  defaultValue={String(t.priority)}
                                />
                              ) : (
                                ""
                              )}

                              <TextInput
                                style={{
                                  flexWrap: "wrap",
                                  borderWidth: 0,
                                  padding: 4,
                                  fontSize: 14,
                                  color:
                                    t.deadline &&
                                    new Date(t.deadline) < new Date()
                                      ? "red"
                                      : "green",
                                }}
                                editable={false}
                                defaultValue={
                                  t.deadline
                                    ? String(t.deadline)
                                    : "No Deadline"
                                }
                              />

                              {t.reminder ? (
                                <Box style={{ borderWidth: 0, padding: 6 }}>
                                  <Clock size={15} strokeWidth={2} />
                                </Box>
                              ) : (
                                ""
                              )}
                            </Heading>
                            <TextInput
                              style={{
                                padding: 4,
                                fontSize: 16,
                                flexWrap: "wrap",
                              }}
                              defaultValue={t.text ? String(t.text) : ""}
                              multiline
                              placeholder="Input a task here..."
                              onEndEditing={(e) =>
                                editTask(t.id, e.nativeEvent.text)
                              }
                            />
                          </VStack>
                          <Button
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            size="xs"
                            className="h-6 px-1 right-2"
                            variant="outline"
                            onPress={() => {
                              setTaskToDelete(t.id);
                              setShowDeleteModal(true);
                            }}
                            style={{
                              backgroundColor: "transparent",
                              borderWidth: 0,
                            }}
                          >
                            <ButtonIcon as={CloseIcon} size={"lg"} />
                          </Button>
                        </HStack>
                      </Card>
                    </Center>
                  </View>
                ))}
                {completedTasks.length == 0 ? (
                  <Box style={{ borderWidth: 0, height: 100 }}></Box>
                ) : (
                  ""
                )}

                {completedTasks.length > 0 && (
                  <>
                    {activeTasks.length > 0 ? (
                      <View>
                        <Divider
                          orientation="horizontal"
                          style={{ marginTop: 10, marginBottom: 10 }}
                        />
                      </View>
                    ) : (
                      ""
                    )}

                    <Text style={{ fontSize: 15, marginBottom: 10 }}>
                      Completed
                    </Text>

                    {completedTasks.map((t) => (
                      <View key={t.id}>
                        <Center>
                          <Card
                            size="lg"
                            variant="outline"
                            className="p-5 rounded-lg w-full m-1"
                            style={{ backgroundColor: "#00000011" }}
                          >
                            <HStack style={{ alignItems: "center" }} space="md">
                              {/* ✅ Section 1 */}
                              <Checkbox
                                isChecked={!t.status}
                                onChange={() =>
                                  updateDoc(doc(db, "tasks", t.id), {
                                    status: !t.status,
                                  })
                                }
                                value={t.id}
                                accessibilityLabel={
                                  t.text ? String(t.text) : ""
                                }
                              >
                                <CheckboxIndicator>
                                  <CheckboxIcon as={CheckIcon} />
                                </CheckboxIndicator>
                              </Checkbox>

                              <Divider orientation="vertical" />

                              {/* 📅 Section 2 */}
                              <VStack style={{ flex: 1, opacity: 0.4 }}>
                                <Heading>
                                  <HStack
                                    style={{ alignItems: "center" }}
                                    space="sm"
                                  >
                                    {t.priority ? (
                                      <Text
                                        style={{
                                          textDecorationLine: "line-through",
                                          fontSize: 14,
                                          color:
                                            t.priority === "Urgent"
                                              ? "red"
                                              : t.priority === "Normal"
                                              ? "blue"
                                              : t.priority === "Low"
                                              ? "green"
                                              : "",
                                        }}
                                      >
                                        {t.priority}
                                      </Text>
                                    ) : (
                                      ""
                                    )}

                                    <Text
                                      style={{
                                        textDecorationLine: "line-through",
                                        fontSize: 14,
                                        color:
                                          t.deadline &&
                                          new Date(t.deadline) < new Date()
                                            ? "red"
                                            : "green",
                                      }}
                                    >
                                      {t.deadline ?? "No Deadline"}
                                    </Text>

                                    {t.reminder && (
                                      <Clock
                                        size={15}
                                        strokeWidth={1}
                                        color="gray"
                                      />
                                    )}
                                  </HStack>
                                </Heading>

                                {/* ✅ Section 2 */}
                                <Text
                                  style={{
                                    textDecorationLine: "line-through",
                                    flexWrap: "wrap",
                                    fontSize: 16,
                                    color: "#555",
                                  }}
                                >
                                  {t.text}
                                </Text>
                              </VStack>

                              {/* <Divider orientation="vertical" /> */}

                              {/* 🗑️ Section 3 */}
                              <Button
                                size="xs"
                                className="h-6 px-1 right-2"
                                variant="outline"
                                onPress={() => {
                                  setTaskToDelete(t.id);
                                  setShowDeleteModal(true);
                                }}
                                style={{
                                  backgroundColor: "transparent",
                                  borderWidth: 0,
                                }}
                              >
                                <ButtonIcon as={CloseIcon} size={"lg"} />
                              </Button>
                            </HStack>
                          </Card>
                        </Center>
                      </View>
                    ))}
                    <Box style={{ borderWidth: 0, height: 100 }}></Box>
                  </>
                )}
              </ScrollView>
            </>
          ) : (
            <Center>
              <Text style={{ fontSize: 20, color: "#00000036", marginTop: 20 }}>
                No task for today
              </Text>
            </Center>
          )}
        </Box>
      </View>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent className="max-w-[305px] items-center">
          <ModalHeader>
            <Box className="w-[56px] h-[56px] rounded-full bg-background-error items-center justify-center">
              <Icon as={TrashIcon} className="stroke-error-600" size="xl" />
            </Box>
          </ModalHeader>
          <ModalBody className="mt-0 mb-4">
            <Heading size="md" className="text-typography-950 mb-2 text-center">
              Delete task confirmation
            </Heading>
            <Text className="text-typography-500 text-center">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </Text>
          </ModalBody>
          <ModalFooter className="w-full">
            <Button
              variant="outline"
              action="secondary"
              size="sm"
              onPress={() => {
                setShowDeleteModal(false);
              }}
              className="flex-grow"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={() => {
                deleteTask(taskToDelete);
                setShowDeleteModal(false);
              }}
              size="sm"
              className="flex-grow"
              style={{ backgroundColor: "red" }}
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        size="lg"
        style={{}}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">Add Task</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <HStack style={{ borderWidth: 0, position: "relative" }}>
              <View>
                <VStack>
                  <Box
                    style={{
                      position: "relative",
                      borderWidth: 1,
                      borderRadius: 20,
                      height: 40,
                      justifyContent: "center",
                      width: 280,
                      marginTop: 10,
                      overflow: "hidden",
                    }}
                  >
                    <HStack
                      style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 12,
                        height: "100%",
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 16,
                          paddingVertical: 0,
                        }}
                        placeholder="Input a task..."
                        value={task}
                        onChangeText={setTask}
                        onSubmitEditing={addTask}
                        autoFocus={true}
                      />
                      <Divider
                        orientation="vertical"
                        style={{
                          height: "60%",
                          marginHorizontal: 8,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        activeOpacity={0.7}
                      >
                        <Icon as={CalendarDaysIcon} size="xl" />
                      </TouchableOpacity>
                    </HStack>
                  </Box>
                </VStack>
              </View>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              style={{ width: 280 }}
              onPress={() => {
                addTask();
                setShowModal(false);
              }}
            >
              <ButtonText>
                {loading ? <Spinner size="small" color="white" /> : "Submit"}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#C7E8FF",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
      >
        <Pressable onPress={() => router.push("/modal")}>
          <Icon as={AddIcon} style={{ width: 50, height: 50 }} color="gray" />
        </Pressable>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    borderWidth: 0,
  },
  title: {
    fontSize: 36,
    marginTop: 50,
    color: "#000000ff",
  },
  input: {
    borderWidth: 0,
    padding: 10,
    marginBottom: 0,
    borderRadius: 5,
    marginLeft: 10,
    height: 37,
    width: 265,
  },
  taskRow: {
    flexDirection: "row",
    marginBottom: 5,
    marginTop: 5,
  },
  taskText: { flex: 1, padding: 4 },
});
