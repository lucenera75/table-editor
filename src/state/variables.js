// Global state variables
export let selectedCells = [];
export let selectedRow = null;
export let selectedColumn = null;
export let contextMenuTarget = null;
export let currentCell = null;
export let anchorCell = null;
export let isEditMode = false;

// Mouse drag selection variables
export let isMouseSelecting = false;
export let selectionStartCell = null;

// Counter for new cells
export let newCellCounter = 0;

// Resize functionality variables
export let isResizing = false;
export let resizeType = null;
export let resizeTarget = null;
export let startX = 0;
export let startY = 0;
export let startWidth = 0;
export let startHeight = 0;
export let resizeLine = null;

// Store the current text selection when using the format menu
export let savedSelection = null;
export let isInputFocused = false;
export let menuHideTimeout = null;

// Undo/Redo system
export let undoStack = [];
export let redoStack = [];
export let lastSnapshot = null;
export const SNAPSHOT_INTERVAL_MS = 1000;
export const MAX_UNDO_STATES = 25;
export let isUndoRedoInProgress = false;
export let snapshotIntervalId = null;

// Design/Edit mode
export let isDesignMode = true;

// Drag and drop functionality for rows and columns
export let draggedRow = null;
export let draggedColumn = null;

// Custom color picker
export let currentBgColor = '';
export let currentTextColor = '#000000';

// Text menu colors
export let currentTextMenuTextColor = '#000000';
export let currentTextMenuBgColor = '';

// Border color
export let currentBorderColor = '#dddddd';

// Setters for variables that need to be modified from other modules
export function setSelectedCells(value) { selectedCells = value; }
export function setSelectedRow(value) { selectedRow = value; }
export function setSelectedColumn(value) { selectedColumn = value; }
export function setContextMenuTarget(value) { contextMenuTarget = value; }
export function setCurrentCell(value) { currentCell = value; }
export function setAnchorCell(value) { anchorCell = value; }
export function setIsEditMode(value) { isEditMode = value; }
export function setIsMouseSelecting(value) { isMouseSelecting = value; }
export function setSelectionStartCell(value) { selectionStartCell = value; }
export function setNewCellCounter(value) { newCellCounter = value; }
export function incrementNewCellCounter() { return ++newCellCounter; }
export function setIsResizing(value) { isResizing = value; }
export function setResizeType(value) { resizeType = value; }
export function setResizeTarget(value) { resizeTarget = value; }
export function setStartX(value) { startX = value; }
export function setStartY(value) { startY = value; }
export function setStartWidth(value) { startWidth = value; }
export function setStartHeight(value) { startHeight = value; }
export function setResizeLine(value) { resizeLine = value; }
export function setSavedSelection(value) { savedSelection = value; }
export function setIsInputFocused(value) { isInputFocused = value; }
export function setMenuHideTimeout(value) { menuHideTimeout = value; }
export function setUndoStack(value) { undoStack = value; }
export function setRedoStack(value) { redoStack = value; }
export function setLastSnapshot(value) { lastSnapshot = value; }
export function setIsUndoRedoInProgress(value) { isUndoRedoInProgress = value; }
export function setSnapshotIntervalId(value) { snapshotIntervalId = value; }
export function setIsDesignMode(value) { isDesignMode = value; }
export function setDraggedRow(value) { draggedRow = value; }
export function setDraggedColumn(value) { draggedColumn = value; }
export function setCurrentBgColor(value) { currentBgColor = value; }
export function setCurrentTextColor(value) { currentTextColor = value; }
export function setCurrentTextMenuTextColor(value) { currentTextMenuTextColor = value; }
export function setCurrentTextMenuBgColor(value) { currentTextMenuBgColor = value; }
export function setCurrentBorderColor(value) { currentBorderColor = value; }
