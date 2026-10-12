# FieldCapture 📸⚡
> **Offline-First Field Inspection & Media Capture Mobile Prototype**  
> Built with **React Native**, **Expo SDK 57**, **React 19**, **Zustand**, and **NetInfo**.

---


https://github.com/user-attachments/assets/69f1dc37-33e0-4915-9e3e-c6f04a51f9fa


## 📌 Executive Summary

**FieldCapture** is an offline-first mobile prototype engineered for field workers, safety technicians, utility personnel, and civil inspectors operating in hazardous or low-connectivity environments (such as power substations, construction yards, and offshore facilities).

The application prioritizes **zero-data-loss field logging**: inspectors can capture high-resolution photos, record video footage, annotate findings with site metadata, and categorize inspection reports without requiring an active internet connection. As soon as network connectivity is re-established, the built-in sync engine automatically pushes pending captures to the cloud with real-time progress indicators and automatic retry policies.

---

## 🚀 Key Prototype Highlights & Features

### 1. 📴 Offline-First Architecture & Local Persistence
- **Local State Persistence**: All inspection records are managed via a reactive [Zustand](https://github.com/pmndrs/zustand) store backed by `@react-native-async-storage/async-storage`.
- **Media File Persistence**: Captured media files are copied to the app's local document sandbox (`field_captures/` via `expo-file-system`) so that files remain intact and accessible even across app reboots or unexpected process termination.
- **Immediate Local Writes**: Inspections are saved locally first, assigning unique UUIDs and queuing them immediately for upload.

### 2. 📷 Multi-Modal Media Capture & Hardware Integration
- **Photo Capture**: Integrated device camera access via `expo-image-picker` with compressed, high-fidelity capture (`0.85` quality).
- **Video Capture**: On-site field video recording with a 60-second limit for capturing dynamic mechanical faults or environmental hazards.
- **Media Library Import**: Pick existing photos and videos directly from the device's photo gallery.
- **Quick-Test Demo Asset**: A built-in fallback button (*"Quick test: Attach demo field sample"*) injects sample inspection imagery instantly, enabling rapid manual evaluation on web browsers or simulators without camera hardware.
- **Interactive Lightbox Preview**: Full-screen preview modal (`MediaPreviewModal`) with metadata overlay (category chip, GPS tag, inspection notes).

### 3. 🌐 Smart Connectivity Awareness & Auto-Sync Engine
- **Hardware Network Detection**: Real-time network state listening with `@react-native-community/netinfo`, tracking both physical connection (`isConnected`) and WAN reachability (`isInternetReachable`).
- **Automatic Reconnection Trigger**: When connectivity switches from offline to online, a background listener automatically flushes the queue of pending and failed uploads without requiring user intervention.
- **Simulated Upload Lifecycle**: Each upload goes through realistic staged states:
  - `pending` (queued) $\rightarrow$ `syncing` (progress tracked at 10% $\rightarrow$ 35% $\rightarrow$ 70% $\rightarrow$ 95% $\rightarrow$ 100%) $\rightarrow$ `synced` (or `error`).
- **Batch & Pull-to-Refresh Sync**: Evaluators can pull-to-refresh the list or tap the top bar's *"Sync (N)"* action to sync the active backlog on demand.

### 4. 🧪 Built-In Chaos & Prototype Evaluation Controls
The prototype includes built-in controls designed specifically for reviewers and QA testers:
- **"Simulate Offline" Switch**: Simulates complete network blackout with a single toggle, allowing you to test offline record creation and queuing behavior without needing airplane mode.
- **"Simulate Upload Failures" Switch**: Injects random remote endpoint timeout errors (HTTP 504 timeouts) into ~60% of uploads. This lets you observe error badges, error messaging, and the manual retry cycle.

### 5. 🛡️ Permission Handling & Deep-Link Recovery UX
- **Contextual Permission Handling**: Custom `useMediaPermissions` hook checks camera and photo library access proactively.
- **Educational Permission Modal**: If a permission request is denied or permanently blocked, `PermissionModal` explains *why* access is required and provides a one-tap deep-link directly into the device's OS application settings (`Linking.openSettings()`).

### 6. 📊 Real-Time KPI Metrics & Status Filtering
- **KPI Summary Header**: At-a-glance counters for **Total**, **Pending**, **Synced**, and **Errors**.
- **Status Filter Strip**: Filter the inspection feed by tab: `All`, `Pending`, `Syncing`, `Synced`, or `Errors`.
- **Storage Cleanup**: One-tap *"Clear Synced"* button removes completed uploads and deletes their cached local files to reclaim device storage.

---

## 🏗️ Technical Architecture & Workflow

```mermaid
flowchart TD
    User([Field Inspector]) -->|Capture Photo / Video| Form[Capture Modal]
    Form -->|Save Record| LocalStorage[(Local FileSystem & AsyncStorage)]
    LocalStorage -->|Enqueue| ZustandStore[Zustand Store: capture-store.ts]
    
    ZustandStore --> CheckNet{Network Online?}
    CheckNet -->|No (Offline)| PendingState[SyncStatus: pending]
    CheckNet -->|Yes (Online)| SyncEngine[Sync Engine]
    
    SyncEngine --> SimulatedUpload[Upload Stream (0% -> 100%)]
    SimulatedUpload -->|Fail / Sim Timeout| ErrorState[SyncStatus: error (Retryable)]
    SimulatedUpload -->|Success| SyncedState[SyncStatus: synced]
    
    NetInfoWatcher[NetInfo Service] -->|On Reconnect| TriggerSync[Auto-flush Pending & Failed]
    TriggerSync --> SyncEngine
```

---

## 📁 Project Structure

```
FieldCapture/
├── src/
│   ├── app/                          # Expo Router file-based pages
│   │   ├── _layout.tsx               # Root navigation stack and splash screen handling
│   │   ├── index.tsx                 # Main Field Capture dashboard screen
│   │   └── explore.tsx               # Architecture & template demo exploration screen
│   │
│   ├── components/                   # UI & feature components
│   │   ├── capture-card.tsx          # Inspection item card (badges, thumbnail, retry)
│   │   ├── capture-modal.tsx         # Full-screen creation sheet with media capture
│   │   ├── empty-state.tsx           # Contextual empty state illustrations
│   │   ├── kpi-summary.tsx           # Top analytics stats & failure simulation switch
│   │   ├── media-preview-modal.tsx   # Lightbox modal for photos and video clips
│   │   ├── network-status-bar.tsx    # Live network indicator & offline simulator switch
│   │   ├── permission-modal.tsx      # System permission denial & settings prompt
│   │   └── status-filter-tabs.tsx    # Horizontal sync status filter bar
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-media-permissions.ts  # Camera and gallery permission requester
│   │   ├── use-network.ts            # Network state subscription hook
│   │   └── use-theme.ts              # Color palette and theme hook
│   │
│   ├── services/                     # Core business services
│   │   ├── network.ts                # NetInfo listener with simulated offline support
│   │   ├── permissions.ts            # Native permission checks & settings deep-linking
│   │   └── storage.ts                # Expo FileSystem media caching & cleanup
│   │
│   ├── store/                        # State management
│   │   └── capture-store.ts          # Zustand store with persistent storage middleware
│   │
│   ├── types/                        # TypeScript domain contracts
│   │   └── capture.ts                # FieldCaptureItem, SyncStatus, Categories
│   │
│   └── constants/
│       └── theme.ts                  # Design tokens, spacing, and brand colors
│
├── app.json                          # Expo application configuration & plugins
├── package.json                      # Dependencies and npm scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 📋 Data Model Reference

Each captured inspection record conforms to the `FieldCaptureItem` interface ([`src/types/capture.ts`](file:///c:/Users/Fahad/Desktop/FieldCapture/FieldCapture/src/types/capture.ts)):

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique UUID v4 generated locally upon capture. |
| `title` | `string` | Brief title describing the site finding. |
| `notes` | `string` | Detailed multi-line notes regarding observations or hazards. |
| `category` | `'safety' \| 'structural' \| 'electrical' \| 'environmental' \| 'general'` | Domain category with corresponding color badge. |
| `mediaUri` | `string` | Local sandboxed filesystem URI or asset URL. |
| `mediaType` | `'photo' \| 'video'` | Media format identifier. |
| `location` | `{ latitude, longitude, name }` | Site coordinates and sector designation (e.g., *Site Sector 3B*). |
| `syncStatus` | `'pending' \| 'syncing' \| 'synced' \| 'error'` | Current status within the synchronization queue. |
| `syncProgress` | `number` | Real-time upload percentage (`0` to `100`). |
| `retryCount` | `number` | Number of attempted upload retries. |
| `errorMessage` | `string?` | Failure reason if an upload encountered an error. |
| `createdAt` | `string` | ISO 8601 timestamp of record creation. |
| `syncedAt` | `string?` | ISO 8601 timestamp of successful server sync. |

---

## 🛠️ Tech Stack & Dependencies

| Layer | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React Native 0.86](https://reactnative.dev) & [Expo SDK 57](https://expo.dev) | Cross-platform runtime targeting Android, iOS, and Web. |
| **Language** | [TypeScript 6](https://www.typescriptlang.org) | Strict type-safety across stores, types, and hooks. |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction) | Native file-based navigation. |
| **State & Storage** | [Zustand 5](https://github.com/pmndrs/zustand) + AsyncStorage | Lightweight store with automated state persistence. |
| **File Sandbox** | [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) | Local disk storage and persistence of captured camera assets. |
| **Hardware Media** | [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | Device camera and photo library interactions. |
| **Image Rendering** | [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) | High-performance image caching and smooth image transitions. |
| **Network State** | [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo) | Real-time connectivity and socket state detection. |
| **Animation & UI** | React Native Reanimated & Safe Area Context | Fluid transitions, status bar padding, and layout safety. |

---

## 💻 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com)
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device, OR an Android/iOS emulator configured, OR run directly in the browser via Web.

### 2. Installation
Clone the repository and install the project dependencies:
```bash
cd FieldCapture
npm install
```

### 3. Running the Application
Start the Expo development server:
```bash
npx expo start
```

From the interactive terminal prompt:
- Press **`a`** to open in an **Android Emulator** or connected Android device.
- Press **`i`** to open in an **iOS Simulator** (macOS only).
- Press **`w`** to open the **Web version** in your default web browser.
- Scan the printed QR code using the **Expo Go** app on your phone.

---

## 🧪 Step-by-Step Prototype Evaluation Walkthrough

Follow these test scenarios to experience all prototype capabilities:

### Scenario A: Testing Offline Capture & Queuing
1. Launch the app and observe the top status indicator: **"Online Ready"**.
2. Toggle the **"Simulate Offline"** switch to **ON**. The bar turns amber and displays **"Offline Mode"**.
3. Tap **"+ New Field Capture"** at the bottom.
4. Select **"Quick test: Attach demo field sample"** (or take a photo using your camera).
5. Enter a title (e.g., *"Compressor Seal Degradation"*), choose a category (e.g., *Safety*), and tap **"Save & Queue Field Capture"**.
6. **Result**: The capture card immediately appears in your feed with an amber **"Pending Sync"** badge. Notice the KPI summary reflects `Pending: 1`.

### Scenario B: Testing Auto-Sync on Network Restoration
1. While still holding pending captures from Scenario A, toggle **"Simulate Offline"** back to **OFF**.
2. **Result**: The app immediately detects that connection is restored (`networkService.onReconnect`), and kicks off an automatic upload.
3. Observe the card's progress bar advance from `Syncing (10%)` $\rightarrow$ `35%` $\rightarrow$ `70%` $\rightarrow$ `100%`.
4. The badge turns green (**"Synced"**), and the `Synced` KPI increments.

### Scenario C: Testing Failure Injection & Retry Logic
1. In the KPI panel, toggle **"Simulate Upload Failures (to test retries)"** to **ON**.
2. Create a new inspection record or tap **"Sync"**.
3. **Result**: Simulated 504 timeouts are randomly introduced. Affected items display a red **"Error"** badge, the failure reason, and an attempt count.
4. Tap **"Retry Upload"** on the card to attempt synchronization again.

### Scenario D: Testing Media Inspection & Storage Management
1. Tap any card's media thumbnail.
2. The full-screen **Media Preview Modal** opens, showing the high-resolution photo/video alongside timestamps, sector location, and notes.
3. Close the modal and tap **"Clear Synced"** in the top navigation bar to clean up processed entries and reclaim local storage.

---

## 🗺️ Production Hardening Roadmap

This prototype establishes the client-side architecture. For an enterprise production deployment, the following enhancements are planned:
- [ ] **Cloud Storage & API Adapter**: Connect the sync engine to an authenticated REST/GraphQL API or direct-to-S3/Supabase signed URL upload service.
- [ ] **Live GPS Geolocation**: Integrate `expo-location` for precise automated latitude/longitude and altitude tracking.
- [ ] **Background Fetch / TaskManager**: Sync pending queues in the background while the app is closed using `expo-background-fetch`.
- [ ] **Local Database (SQLite)**: Scale local storage from AsyncStorage to `expo-sqlite` with WatermelonDB or PowerSync for millions of records.
- [ ] **Conflict Resolution & Delta Syncing**: Add version vectors to handle simultaneous edits between field devices and central dispatch.

---

## 📄 License
This project is licensed under the [MIT License](file:///c:/Users/Fahad/Desktop/FieldCapture/FieldCapture/LICENSE).
