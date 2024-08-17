import Workspace from "@/models/workspace";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";
import {
  ArrowCounterClockwise,
  DotsThree,
  PencilSimple,
  Trash,
  X,
  Check,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import truncate from "truncate";

const THREAD_CALLOUT_DETAIL_WIDTH = 26;
export default function ThreadItem({
  idx,
  activeIdx,
  isActive,
  workspace,
  thread,
  onRemove,
  toggleMarkForDeletion,
  hasNext,
  ctrlPressed = false,
}) {
  const { slug } = useParams();
  const optionsContainer = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(thread.name);
  const linkTo = !thread.slug
    ? paths.workspace.chat(slug)
    : paths.workspace.thread(slug, thread.slug);

  const handleRename = async () => {
    if (newName.trim() === thread.name || newName.trim().length === 0) {
      setIsRenaming(false);
      setNewName(thread.name);
      return;
    }

    const { message } = await Workspace.threads.update(
      workspace.slug,
      thread.slug,
      { name: newName.trim() }
    );
    if (message) {
      showToast(`Thread could not be updated! ${message}`, "error", {
        clear: true,
      });
      setIsRenaming(false);
      setNewName(thread.name);
      return;
    }

    thread.name = newName.trim();
    setIsRenaming(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
      setNewName(thread.name);
    }
  };

  return (
    <div
      className="w-full relative flex h-[38px] items-center border-none hover:bg-slate-600/20 rounded-lg"
      role="listitem"
    >
      {/* Curved line Element and leader if required */}
      <div
        style={{ width: THREAD_CALLOUT_DETAIL_WIDTH / 2 }}
        className={`${
          isActive
            ? "border-l-2 border-b-2 border-white"
            : "border-l border-b border-slate-300"
        } h-[50%] absolute top-0 z-10 left-2 rounded-bl-lg`}
      ></div>
      {/* Downstroke border for next item */}
      {hasNext && (
        <div
          style={{ width: THREAD_CALLOUT_DETAIL_WIDTH / 2 }}
          className={`${
            idx <= activeIdx && !isActive
              ? "border-l-2 border-white"
              : "border-l border-slate-300"
          } h-[100%] absolute top-0 z-1 left-2`}
        ></div>
      )}

      {/* Curved line inline placeholder for spacing - not visible */}
      <div
        style={{ width: THREAD_CALLOUT_DETAIL_WIDTH + 8 }}
        className="h-full"
      />
      <div className="flex w-full items-center justify-between pr-2 group relative">
        {thread.deleted ? (
          <div className="w-full flex justify-between">
            <div className="w-full ">
              <p className={`text-left text-sm text-slate-400/50 italic`}>
                deleted thread
              </p>
            </div>
            {ctrlPressed && (
              <button
                type="button"
                className="border-none"
                onClick={() => toggleMarkForDeletion(thread.id)}
              >
                <ArrowCounterClockwise
                  className="text-zinc-300 hover:text-white"
                  size={18}
                />
              </button>
            )}
          </div>
        ) : isRenaming ? (
          <div className="w-full flex items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-white border-none focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              className="border-none ml-2"
              onClick={handleRename}
            >
              <Check
                className="text-green-500 hover:text-green-400"
                size={18}
              />
            </button>
          </div>
        ) : (
          <a
            href={
              window.location.pathname === linkTo || ctrlPressed ? "#" : linkTo
            }
            className="w-full"
            aria-current={isActive ? "page" : ""}
          >
            <p
              className={`text-left text-sm ${
                isActive ? "font-medium text-white" : "text-slate-400"
              }`}
            >
              {truncate(thread.name, 25)}
            </p>
          </a>
        )}
        {!!thread.slug && !thread.deleted && !isRenaming && (
          <div ref={optionsContainer}>
            {ctrlPressed ? (
              <button
                type="button"
                className="border-none"
                onClick={() => toggleMarkForDeletion(thread.id)}
              >
                <X
                  className="text-zinc-300 hover:text-white"
                  weight="bold"
                  size={18}
                />
              </button>
            ) : (
              <div className="flex items-center w-fit group-hover:visible md:invisible gap-x-1">
                <button
                  type="button"
                  className="border-none"
                  onClick={() => setShowOptions(!showOptions)}
                  aria-label="Thread options"
                >
                  <DotsThree className="text-slate-300" size={25} />
                </button>
              </div>
            )}
            {showOptions && (
              <OptionsMenu
                containerRef={optionsContainer}
                workspace={workspace}
                thread={thread}
                onRemove={onRemove}
                close={() => setShowOptions(false)}
                startRenaming={() => {
                  setIsRenaming(true);
                  setShowOptions(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OptionsMenu({
  containerRef,
  workspace,
  thread,
  onRemove,
  close,
  startRenaming,
}) {
  const menuRef = useRef(null);

  const outsideClick = useCallback(
    (e) => {
      if (!menuRef.current) return false;
      if (
        !menuRef.current?.contains(e.target) &&
        !containerRef.current?.contains(e.target)
      )
        close();
      return false;
    },
    [containerRef, close]
  );

  const isEsc = useCallback(
    (e) => {
      if (e.key === "Escape" || e.key === "Esc") close();
    },
    [close]
  );

  useEffect(() => {
    function setListeners() {
      if (!menuRef?.current || !containerRef.current) return false;
      window.document.addEventListener("click", outsideClick);
      window.document.addEventListener("keyup", isEsc);
    }

    function cleanupListeners() {
      window.removeEventListener("click", outsideClick);
      window.removeEventListener("keyup", isEsc);
    }

    setListeners();
    return cleanupListeners;
  }, [containerRef, close, isEsc, outsideClick]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this thread? All of its chats will be deleted. You cannot undo this."
      )
    )
      return;
    const success = await Workspace.threads.delete(workspace.slug, thread.slug);
    if (!success) {
      showToast("Thread could not be deleted!", "error", { clear: true });
      return;
    }
    if (success) {
      showToast("Thread deleted successfully!", "success", { clear: true });
      onRemove(thread.id);
      return;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute w-fit z-[20] top-[25px] right-[10px] bg-zinc-900 rounded-lg p-1"
    >
      <button
        onClick={startRenaming}
        type="button"
        className="w-full rounded-md flex items-center p-2 gap-x-2 hover:bg-slate-500/20 text-slate-300"
      >
        <PencilSimple size={18} />
        <p className="text-sm">Rename</p>
      </button>
      <button
        onClick={handleDelete}
        type="button"
        className="w-full rounded-md flex items-center p-2 gap-x-2 hover:bg-red-500/20 text-slate-300 hover:text-red-100"
      >
        <Trash size={18} />
        <p className="text-sm">Delete Thread</p>
      </button>
    </div>
  );
}
