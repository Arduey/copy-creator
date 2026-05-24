import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import IosSelect from "../../components/IosSelect";
import type { ApiKeyLabel } from "../../types";

const SERVICE_TEMPLATES = [
  { name: "OpenAI", apiBase: "https://api.openai.com/v1" },
  { name: "DeepSeek", apiBase: "https://api.deepseek.com/v1" },
  { name: "Kimi", apiBase: "https://api.moonshot.cn/v1" },
  { name: "通义千问", apiBase: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { name: "智谱 GLM", apiBase: "https://open.bigmodel.cn/api/paas/v4" },
  { name: "Grok", apiBase: "https://api.x.ai/v1" },
  { name: "Gemini", apiBase: "https://generativelanguage.googleapis.com/v1beta" },
  { name: "Claude", apiBase: "https://api.anthropic.com/v1" },
  { name: "自定义", apiBase: "" },
];

const SERVICE_OPTIONS = SERVICE_TEMPLATES.map((t) => ({ value: t.name, label: t.name }));

interface Props {
  keyPreview: string;
  existingLabel: ApiKeyLabel | null | undefined;
  guessedService: string | null | undefined;
  onSave: () => void;
  onCancel: () => void;
}

export default function ApiKeyLabelPanel({
  keyPreview,
  existingLabel,
  guessedService,
  onSave,
  onCancel,
}: Props) {
  const defaultService =
    existingLabel?.service ||
    (guessedService && SERVICE_TEMPLATES.find((t) => t.name === guessedService)
      ? guessedService
      : "OpenAI");

  const defaultApiBase =
    existingLabel?.api_base ||
    SERVICE_TEMPLATES.find((t) => t.name === defaultService)?.apiBase ||
    "";

  const [service, setService] = useState(defaultService);
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [note, setNote] = useState(existingLabel?.note || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingLabel) {
      const tpl = SERVICE_TEMPLATES.find((t) => t.name === service);
      if (tpl) setApiBase(tpl.apiBase);
    }
  }, [service, existingLabel]);

  const handleServiceChange = (val: string) => {
    setService(val);
    if (!existingLabel) {
      const tpl = SERVICE_TEMPLATES.find((t) => t.name === val);
      if (tpl) setApiBase(tpl.apiBase);
    }
  };

  const handleSave = async () => {
    if (!service.trim()) return;
    setSaving(true);
    try {
      await invoke("save_api_key_label", {
        keyPreview,
        service: service.trim(),
        apiBase: apiBase.trim(),
        note: note.trim(),
      });
      onSave();
    } catch (e) {
      console.error("Failed to save label:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="api-key-label-panel" onClick={(e) => e.stopPropagation()}>
      <div className="label-panel-row">
        <span className="label-panel-field-name">服务</span>
        <IosSelect value={service} options={SERVICE_OPTIONS} onChange={handleServiceChange} />
      </div>
      <div className="label-panel-row">
        <span className="label-panel-field-name">地址</span>
        <input
          className="dialog-input label-panel-input"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          placeholder="https://api.example.com/v1"
        />
      </div>
      <div className="label-panel-row">
        <span className="label-panel-field-name">备注</span>
        <input
          className="dialog-input label-panel-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="备注（可选）"
        />
      </div>
      <div className="label-panel-actions">
        <button className="dialog-btn secondary" onClick={onCancel} type="button">
          取消
        </button>
        <button
          className="dialog-btn primary"
          onClick={handleSave}
          disabled={saving || !service.trim()}
          type="button"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
