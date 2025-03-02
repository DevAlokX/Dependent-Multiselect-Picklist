# Multi-Select Dependent Picklist LWC for Screen Flow

## 🚀 Introduction
This Lightning Web Component (LWC) provides a **multi-select dependent picklist** for **Salesforce Screen Flow**. It supports fetching **existing record values** and prepopulating them in the picklist. If no values exist, it initializes with all available options.

---

## 🎯 Key Features
- Fetches and displays **existing record values** if available.
- Supports **multi-select dependent picklist** functionality.
- Works seamlessly with **Salesforce Screen Flows**.
- Supports **custom and standard objects**.
- Handles **parent-child dependency** for picklist fields.

---

## 🛠️ Installation
```sh
git clone https://github.com/your-repo/multiselect-dependent-picklist.git
cd multiselect-dependent-picklist
sfdx force:source:deploy -p force-app
