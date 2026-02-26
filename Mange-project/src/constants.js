// src/constants.js - TeamFlow v3

export const MEMBER_COLOR_DEFAULT = "#00ccff";

export const THEME_COLORS = [
  "#00ff88","#00ccff","#ff00cc","#ffaa00","#ccff00","#b026ff","#ff4444",
];

export const INITIAL_TASKS = [
  { id:"t1", week:1, title:"Install MySQL Server 8.0+",     assignee:"All", deadline:false },
  { id:"t2", week:1, title:"Install MySQL Workbench",       assignee:"All", deadline:false },
  { id:"t3", week:1, title:"Install VS Code + Extensions",  assignee:"All", deadline:false },
  { id:"t4", week:1, title:"Install Git + GitHub Desktop",  assignee:"All", deadline:false },
  { id:"t5", week:1, title:"Create GitHub Repo (Private)",  assignee:"All", deadline:false },
  { id:"t6", week:1, title:"Read UGC Circular No. 12-2024", assignee:"All", deadline:false },
];

export const WEEK_INFO = {
  1:{dates:"Feb 23-Mar 1"}, 2:{dates:"Mar 2-8"},   3:{dates:"Mar 9-15"},
  4:{dates:"Mar 16-22"},    5:{dates:"Mar 23-29"},  6:{dates:"Mar 30-Apr 5"},
  7:{dates:"Apr 6-13"},     8:{dates:"Apr 14-21"},  9:{dates:"Apr 22-28"},
  10:{dates:"Apr 29-May 5"},
};

export const TABS = [
  { id:"tasks",    label:"TASKS",     icon:"T" },
  { id:"team",     label:"TEAM",      icon:"G" },
  { id:"data",     label:"RESOURCES", icon:"R" },
  { id:"chat",     label:"CHAT",      icon:"C" },
  { id:"quiz",     label:"QUIZ",      icon:"Q" },
  { id:"settings", label:"SETTINGS",  icon:"S" },
];

// Firestore collections
export const TASKS_COL       = "tasks";
export const CHAT_COL        = "chat";
export const USERS_COL       = "users";
export const RESOURCES_COL   = "resources";
export const WEEK_STATUS_COL = "week_status";
export const QUIZZES_COL     = "quizzes";
export const PROJECTS_COL    = "projects";

// Admin
export const ADMIN_USER  = "admin";
export const ADMIN_PASS  = "admin1234";
export const ADMIN_EMAIL = "admin@teamflow.internal";
export const OWNER_NAME  = "Hass Kariyawasam";

// Assignee options for tasks (no numbered roles)
export const ASSIGNEE_OPTS = ["All", "Leader", "Member"];
