import type { ComponentChildren } from "preact";
import { type TargetedEvent, useEffect } from "preact/compat";
import { useSignal } from "@preact/signals";
import { Button } from "./Button";

const getId = (v: string) => v.toLowerCase().replace(/[^A-Za-z0-9]+/g, "-");

export function Tabs({ tabs: _tabs }: { tabs: { id?: string, title: string, content: ComponentChildren }[] }) {
  const selectedTab = useSignal<string>();
  const tabs = _tabs.map((tab) => ({ ...tab, id: tab.id ?? getId(tab.title) }));

  useEffect(() => {
    const selected = selectedTab.value;
    if (tabs.length && (!selected || !tabs.find((t) => t.id === selected))) {
      selectedTab.value = tabs[0].id;
    }
  }, [_tabs]);

  const handleKeydown = (ev: TargetedEvent<HTMLButtonElement, KeyboardEvent>, id: string) => {
    const index = tabs.findIndex((t) => t.id === id);
    let keyPressed = true;

    switch (ev.key) {
      case "ArrowLeft":
        if (index === 0) selectedTab.value = tabs.slice(-1)[0].id;
        else selectedTab.value = tabs[index - 1].id;
        break;
      case "ArrowRight":
        if (index === tabs.length - 1) selectedTab.value = tabs[0].id;
        else selectedTab.value = tabs[index + 1].id;
        break;
      case "Home":
        selectedTab.value = tabs[0].id;
        break;
      case "End":
        selectedTab.value = tabs.slice(-1)[0].id;
        break;
      default:
        keyPressed = false;
    }

    document.getElementById(`tab-${selectedTab.value}`)!.focus();

    if (keyPressed) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  return (
    <>
      <div role="tablist" class="flex flex-row">
        {tabs.map(({ id, title }) => (
          <Button
            color={ id === selectedTab.value ? "purple" : "gray" }
            class="border-b-0 rounded-b-none"
            id={`tab-${id}`}
            aria-controls={`tabpanel-${id}`}
            aria-selected={ id === selectedTab.value }
            tabIndex={id === selectedTab.value ? 0 : -1}
            type="button"
            role="tab"
            onClick={() => selectedTab.value = id}
            onKeyDown={(ev) => handleKeydown(ev, id)}
          >
            {title}
          </Button>
        ))}
      </div>
      <div class="border-1 rounded-xl rounded-tl-none p-2 border-stone-900">
        {tabs.map(({ id, content }) => (
          <div
            id={`tabpanel-${id}`}
            aria-labelledby={`tab-${id}`}
            role="tabpanel"
            class={selectedTab.value !== id ? "hidden" : ""}
            tabIndex={0}
          >
            { content }
          </div>
        ))}
      </div>
    </>
  )
}