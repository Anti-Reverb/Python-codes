// bspwm-like.js
// Hyprland / bspwm-style Binary Space Partitioning layout for Amethyst
//
// Behavior:
// - First window fills the screen.
// - Subsequent windows split the currently focused tile 50/50 (auto vertical/horizontal).
// - Remove rebuilds tree from remaining windows (simple and safe).
//
// Drop this into Amethyst Layouts directory and select it as your layout.

function layout() {
  // Helper constructors
  function makeLeaf(id) {
    return { id: id, left: null, right: null };
  }

  function makeInternal(leftNode, rightNode) {
    return { id: null, left: leftNode, right: rightNode };
  }

  // Find a node by id; also optionally return parent via reference object
  function findNode(node, id, parent = null) {
    if (!node) return null;
    if (node.id === id) return { node: node, parent: parent };
    let found = findNode(node.left, id, node);
    if (found) return found;
    return findNode(node.right, id, node);
  }

  // Insert newId by splitting targetLeafId. If targetLeafId not found, return false.
  // Splitting behavior: replace the leaf node matching target with an internal node
  // whose left = old leaf, right = new leaf (so new window becomes sibling).
  function splitNodeAt(treeRoot, targetLeafId, newId) {
    if (!treeRoot) return makeLeaf(newId); // empty tree => new leaf
    let found = findNode(treeRoot, targetLeafId, null);
    if (!found) {
      return null;
    }

    const leaf = found.node;
    const parent = found.parent;

    // create new internal node where left = old leaf, right = new leaf
    const newInternal = makeInternal(
      makeLeaf(leaf.id),
      makeLeaf(newId)
    );

    // If leaf was root
    if (!parent) {
      return newInternal;
    }

    // Otherwise replace parent's left/right reference
    if (parent.left === leaf) {
      parent.left = newInternal;
    } else if (parent.right === leaf) {
      parent.right = newInternal;
    }

    return treeRoot;
  }

  // Insert at end: traverse right-most leaves and append (mimics insertWindowIDAtEnd)
  function insertAtEnd(treeRoot, newId) {
    if (!treeRoot) {
      return makeLeaf(newId);
    }

    // walk down right-most path until we find a leaf slot
    let cur = treeRoot;
    let parent = null;
    while (cur.left !== null && cur.right !== null) {
      parent = cur;
      // prefer right
      cur = cur.right;
    }

    // cur is a leaf node
    if (cur.id !== null) {
      // replace leaf with internal node (left = old leaf, right = new leaf)
      if (!parent && treeRoot === cur) {
        // root leaf -> become internal
        treeRoot = makeInternal(makeLeaf(cur.id), makeLeaf(newId));
      } else {
        // cur is child of some internal node (parent exists)
        const newInternal = makeInternal(makeLeaf(cur.id), makeLeaf(newId));
        if (parent.left === cur) parent.left = newInternal;
        else parent.right = newInternal;
      }
    } else {
      // theoretically shouldn't reach here
      // fallback: set right to new leaf
      cur.right = makeLeaf(newId);
    }

    return treeRoot;
  }

  // Rebuild tree from ordered window IDs, using lastFocused as the preferred insertion point
  // windowsArr is an array of ids in the order we want to process them
  function buildTreeFromWindows(windowsArr, lastFocused) {
    let tree = null;
    if (windowsArr.length === 0) return null;
    // first becomes root leaf
    tree = makeLeaf(windowsArr[0]);

    for (let i = 1; i < windowsArr.length; ++i) {
      const id = windowsArr[i];
      if (lastFocused && findNode(tree, lastFocused)) {
        // try split at lastFocused; if fails, fallback to insert at end
        const maybe = splitNodeAt(tree, lastFocused, id);
        if (maybe) tree = maybe;
        else tree = insertAtEnd(tree, id);
      } else {
        tree = insertAtEnd(tree, id);
      }
    }

    return tree;
  }

  // Traverse tree and compute frames for leaves. The traversal receives a node and a CGRect-like frame
  // and when encountering a leaf, emits a mapping id -> frame object.
  function layoutTraverse(node, frame, out) {
    if (!node) return;
    if (node.id !== null) {
      // leaf
      out[node.id] = {
        x: Math.round(frame.x),
        y: Math.round(frame.y),
        width: Math.round(frame.width),
        height: Math.round(frame.height),
        isMain: false,
        unconstrainedDimension: "horizontal"
      };
      return;
    }

    // internal node: split 50/50 according to aspect
    if (frame.width > frame.height) {
      // vertical split (left/right)
      const leftFrame = { x: frame.x, y: frame.y, width: frame.width / 2, height: frame.height };
      const rightFrame = { x: frame.x + frame.width / 2, y: frame.y, width: frame.width / 2, height: frame.height };
      layoutTraverse(node.left, leftFrame, out);
      layoutTraverse(node.right, rightFrame, out);
    } else {
      // horizontal split (top/bottom)
      const topFrame = { x: frame.x, y: frame.y, width: frame.width, height: frame.height / 2 };
      const bottomFrame = { x: frame.x, y: frame.y + frame.height / 2, width: frame.width, height: frame.height / 2 };
      layoutTraverse(node.left, topFrame, out);
      layoutTraverse(node.right, bottomFrame, out);
    }
  }

  // The layout object we return to Amethyst
  return {
    name: "bspwm-like",
    initialState: {
      // tracked window ids in insertion order (used when rebuilding)
      windows: [],
      // tree structure as described above
      tree: null,
      // last known focused window id
      lastFocused: null,
      // recommended ratio (not heavily used but kept for possible resize interactions)
      ratio: 0.5
    },

    // no custom commands for now
    commands: {},

    // Main function to return frames for windows
    // windows: array of { id, frame, isFocused }
    // screenFrame: { x,y,width,height } (top-level)
    // state: our state object
    // extendedFrames: ignored for this layout
    getFrameAssignments: function (windows, screenFrame, state, extendedFrames) {
      // Ensure our internal windows list matches actual windows
      const currentIDs = windows.map(w => w.id);

      // if state.windows is out of sync, resync (this happens on startup)
      if (!arrayEquals(currentIDs, state.windows)) {
        state.windows = currentIDs.slice();
        state.tree = buildTreeFromWindows(state.windows, state.lastFocused);
      }

      // Special-case: single window -> fill screen (monocle style)
      if (windows.length === 1) {
        const only = windows[0];
        const f = {
          x: Math.round(screenFrame.x),
          y: Math.round(screenFrame.y),
          width: Math.round(screenFrame.width),
          height: Math.round(screenFrame.height),
          isMain: false,
          unconstrainedDimension: "horizontal"
        };
        const ret = {};
        ret[only.id] = f;
        return ret;
      }

      // If tree is missing (rare), rebuild from current windows
      if (!state.tree) {
        state.tree = buildTreeFromWindows(state.windows, state.lastFocused);
      }

      // Walk tree to compute frames
      const out = {};
      layoutTraverse(state.tree, screenFrame, out);

      // It's possible some windows are not in tree (race); ensure they are placed:
      currentIDs.forEach(id => {
        if (!out[id]) {
          // fallback: place them as tiny tiles at top-left so they are still visible
          out[id] = { x: screenFrame.x, y: screenFrame.y, width: 100, height: 100, isMain: false, unconstrainedDimension: "horizontal" };
        }
      });

      return out;
    },

    // Handle incremental changes coming from Amethyst
    updateWithChange: function (change, state) {
      // change is an object with .change and optional .windowID/.otherWindowID
      const c = change.change;
      switch (c) {
        case "add": {
          const wid = change.windowID;
          // only add if not tracked
          if (!state.windows.includes(wid)) {
            state.windows.push(wid);
            // prefer to split lastFocused if possible
            if (state.lastFocused && findNode(state.tree, state.lastFocused)) {
              const maybe = splitNodeAt(state.tree, state.lastFocused, wid);
              if (maybe) state.tree = maybe;
              else state.tree = insertAtEnd(state.tree, wid);
            } else {
              state.tree = insertAtEnd(state.tree, wid);
            }
          }
          break;
        }
        case "remove": {
          const wid = change.windowID;
          state.windows = state.windows.filter(i => i !== wid);
          // Rebuild from remaining windows (simple & robust)
          state.tree = buildTreeFromWindows(state.windows, state.lastFocused);
          break;
        }
        case "focus_changed": {
          state.lastFocused = change.windowID || null;
          break;
        }
        case "window_swap": {
          // swap two ids in the tracked list and rebuild tree to be safe
          const a = change.windowID, b = change.otherWindowID;
          const idxA = state.windows.indexOf(a);
          const idxB = state.windows.indexOf(b);
          if (idxA !== -1 && idxB !== -1) {
            state.windows[idxA] = b;
            state.windows[idxB] = a;
            state.tree = buildTreeFromWindows(state.windows, state.lastFocused);
          }
          break;
        }
        case "space_change":
        case "layout_change":
        case "application_activate":
        case "application_deactivate":
        case "unknown":
        default:
          // no-op for others
          break;
      }
      return state;
    },

    // simple ratio recommender; leave ratio unchanged or set it if recommended
    recommendMainPaneRatio: function (ratio, state) {
      // clamp to [0, 1]
      state.ratio = Math.max(0, Math.min(1, ratio));
      return state;
    }
  };

  // tiny helper to compare arrays of ids
  function arrayEquals(a, b) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
