import {
  collection, doc, addDoc, deleteDoc, updateDoc, setDoc, getDoc,
  onSnapshot, query, orderBy, serverTimestamp, type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// ── Types ──────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  text: string
  due: string
  priority: "low" | "medium" | "high"
  done: boolean
  date: string
}

export interface FoodItem {
  id: string
  name: string
  calories: number
  source: "home" | "hotel"
  date: string
}

export interface ExerciseItem {
  id: string
  name: string
  minutes: number
  calories: number
  date: string
}

export interface WorkItem {
  id: string
  name: string
  hours: number
  date: string
}

export interface ScreenItem {
  id: string
  name: string
  hours: number
  date: string
}

export interface UserSettings {
  maintenance: number | ""
  unit: string
  profile: {
    weight?: number
    height?: number
    age?: number
    sex?: string
    activity?: number
  }
}

export interface WeightLog {
  id: string
  kg: number
  date: string
}

// ── Settings ───────────────────────────────────────────────────────────────

export async function getSettings(uid: string): Promise<UserSettings> {
  const snap = await getDoc(doc(db, "users", uid, "meta", "settings"))
  if (snap.exists()) return snap.data() as UserSettings
  return { maintenance: "", unit: "kg", profile: {} }
}

export async function saveSettings(uid: string, settings: UserSettings): Promise<void> {
  await setDoc(doc(db, "users", uid, "meta", "settings"), settings)
}

// ── Generic subscribe helper ───────────────────────────────────────────────

function subscribeTo<T extends { id: string }>(
  uid: string,
  coll: string,
  callback: (items: T[]) => void
): Unsubscribe {
  const q = query(collection(db, "users", uid, coll), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)))
  })
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export const subscribeTasks = (uid: string, cb: (items: Task[]) => void) =>
  subscribeTo<Task>(uid, "tasks", cb)

export async function addTask(uid: string, item: Omit<Task, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "tasks"), { ...item, createdAt: serverTimestamp() })
}

export async function toggleTask(uid: string, id: string, done: boolean): Promise<void> {
  await updateDoc(doc(db, "users", uid, "tasks", id), { done })
}

export async function deleteTask(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "tasks", id))
}

// ── Food ───────────────────────────────────────────────────────────────────

export const subscribeFood = (uid: string, cb: (items: FoodItem[]) => void) =>
  subscribeTo<FoodItem>(uid, "food", cb)

export async function addFood(uid: string, item: Omit<FoodItem, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "food"), { ...item, createdAt: serverTimestamp() })
}

export async function deleteFood(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "food", id))
}

// ── Exercise ───────────────────────────────────────────────────────────────

export const subscribeExercise = (uid: string, cb: (items: ExerciseItem[]) => void) =>
  subscribeTo<ExerciseItem>(uid, "exercise", cb)

export async function addExercise(uid: string, item: Omit<ExerciseItem, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "exercise"), { ...item, createdAt: serverTimestamp() })
}

export async function deleteExercise(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "exercise", id))
}

// ── Work ───────────────────────────────────────────────────────────────────

export const subscribeWork = (uid: string, cb: (items: WorkItem[]) => void) =>
  subscribeTo<WorkItem>(uid, "work", cb)

export async function addWork(uid: string, item: Omit<WorkItem, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "work"), { ...item, createdAt: serverTimestamp() })
}

export async function deleteWork(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "work", id))
}

// ── Screen ─────────────────────────────────────────────────────────────────

export const subscribeScreen = (uid: string, cb: (items: ScreenItem[]) => void) =>
  subscribeTo<ScreenItem>(uid, "screen", cb)

export async function addScreen(uid: string, item: Omit<ScreenItem, "id">): Promise<void> {
  await addDoc(collection(db, "users", uid, "screen"), { ...item, createdAt: serverTimestamp() })
}

export async function deleteScreen(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "screen", id))
}

// ── Weight ─────────────────────────────────────────────────────────────────

export const subscribeWeights = (uid: string, cb: (items: WeightLog[]) => void) =>
  subscribeTo<WeightLog>(uid, "weights", cb)

export async function logWeight(uid: string, kg: number, date: string): Promise<void> {
  await setDoc(doc(db, "users", uid, "weights", date), { kg, date, createdAt: serverTimestamp() })
}

export async function deleteWeightLog(uid: string, date: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "weights", date))
}

// ── Helpers ────────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().slice(0, 10)
export const todays = <T extends { date: string }>(arr: T[]) => arr.filter((x) => x.date === today())
export const sum = <T>(arr: T[], fn: (x: T) => number) => arr.reduce((a, x) => a + (fn(x) || 0), 0)
export const round1 = (n: number) => Math.round(n * 10) / 10
export const KCAL_PER_KG = 7700
