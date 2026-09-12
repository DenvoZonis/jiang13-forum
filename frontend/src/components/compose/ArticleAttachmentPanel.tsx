import { useRef, useState } from 'react';
import { Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { notify } from '@/lib/notify';
import { api } from '@/api/client';
import type { PostAttachmentInput, ForumLimitsPublic } from '@/api/types';

interface Props {
  attachments: PostAttachmentInput[];
  onChange: (list: PostAttachmentInput[]) => void;
  limits: ForumLimitsPublic;
}

/** 从文件名提取小写、不含点的扩展名 */
function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  if (i < 0 || i === name.length - 1) return '';
  return name.slice(i + 1).toLowerCase();
}

function formatSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(n >= 100 || u === 0 ? 0 : 1)} ${units[u]}`;
}

/**
 * 发帖附件面板：上传文件到对象存储/本地，提交时随帖子保存。
 * 类型、个数、大小限制来自后台配置（limits.post_file_*）。
 */
export default function ArticleAttachmentPanel({ attachments, onChange, limits }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const allowed = limits.post_file_allowed_exts ?? [];
  const maxCount = limits.post_file_max_count;
  const maxMB = limits.post_file_max_mb;

  const disabled = allowed.length === 0;
  const remaining = maxCount > 0 ? Math.max(0, maxCount - attachments.length) : Infinity;

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    const valid: File[] = [];
    for (const f of files) {
      const ext = extOf(f.name);
      if (!allowed.includes(ext)) {
        notify.warning(`不支持的文件类型：${ext || '无扩展名'}`);
        continue;
      }
      if (maxMB > 0 && f.size > maxMB * 1024 * 1024) {
        notify.warning(`「${f.name}」超过 ${maxMB}MB 大小限制`);
        continue;
      }
      valid.push(f);
    }
    if (!valid.length) return;
    if (maxCount > 0 && attachments.length + valid.length > maxCount) {
      notify.warning(`每个帖子最多上传 ${maxCount} 个文件`);
      return;
    }

    setUploading(true);
    const added: PostAttachmentInput[] = [];
    try {
      for (const f of valid) {
        try {
          const r = await api.uploadPostFile(f);
          added.push({ name: r.name, url: r.url, size: r.size, content_type: r.content_type });
        } catch (e: unknown) {
          notify.error(e instanceof Error ? e.message : '上传失败');
        }
      }
    } finally {
      setUploading(false);
    }
    if (added.length) {
      const seen = new Set(attachments.map(a => a.url));
      onChange([...attachments, ...added.filter(a => !seen.has(a.url))]);
    }
  };

  const remove = (url: string) => {
    onChange(attachments.filter(a => a.url !== url));
  };

  return (
    <div className="compose-attachments">
      <div className="compose-attachments-head">
        <span className="compose-attachments-title">
          <Paperclip size={14} aria-hidden />
          附件
          {maxCount > 0 && <span className="compose-attachments-count">{attachments.length}/{maxCount}</span>}
        </span>
        <button
          type="button"
          className="compose-attachments-add"
          disabled={disabled || uploading || remaining <= 0}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 size={14} className="compose-attachments-spin" /> : '添加附件'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          accept={allowed.map(e => `.${e}`).join(',')}
          onChange={e => {
            void handleFiles([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>

      {disabled ? (
        <p className="compose-attachments-hint">管理员未启用附件上传</p>
      ) : (
        <>
          {attachments.length === 0 ? (
            <p className="compose-attachments-hint">
              {allowed.length ? `支持类型：${allowed.map(e => `.${e}`).join(' / ')}` : ''}
              {maxMB > 0 ? `；单个不超过 ${maxMB}MB` : ''}
            </p>
          ) : (
            <ul className="compose-attachments-list">
              {attachments.map(a => (
                <li key={a.url} className="compose-attachment">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="compose-attachment-link"
                    title={a.name}
                  >
                    <FileText size={15} aria-hidden />
                    <span className="compose-attachment-name">{a.name}</span>
                    <span className="compose-attachment-size">{formatSize(a.size)}</span>
                  </a>
                  <button
                    type="button"
                    className="compose-attachment-remove"
                    aria-label={`移除 ${a.name}`}
                    onClick={() => remove(a.url)}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
