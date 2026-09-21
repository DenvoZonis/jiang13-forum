import {
  CircleCheck,
  CircleHelp,
  EllipsisVertical,
  History,
  Lock,
  LockOpen,
  MessageSquareOff,
  Pencil,
  Pin,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PostItem } from '../api/types';

export interface PostManageMenuProps {
  post: PostItem;
  isAdmin: boolean;
  isOwnerOrAdmin: boolean;
  canEdit: boolean;
  isEdited: boolean;
  isMobile?: boolean;
  editRemaining?: string;
  editBlockReason?: string;
  /** 当前用户是否可删除该帖（帖主在可删除时限内或管理员） */
  canDelete?: boolean;
  /** 不可删除的原因（可删除时为空） */
  deleteBlockReason?: string;
  deleting?: boolean;
  onEdit: () => void;
  onShowRevisions: () => void;
  onToggleResolved: () => void;
  onFeature: () => void;
  onPin: () => void;
  onBoardPin: () => void;
  onLock: () => void;
  onCommentsLock: () => void;
  onDelete: () => void;
}

/** 帖子右上角管理菜单：编辑、置顶、锁定、删除等 */
export default function PostManageMenu({
  post,
  isAdmin,
  isOwnerOrAdmin,
  canEdit,
  isEdited,
  isMobile,
  editRemaining,
  editBlockReason,
  canDelete,
  deleteBlockReason,
  deleting,
  onEdit,
  onShowRevisions,
  onToggleResolved,
  onFeature,
  onPin,
  onBoardPin,
  onLock,
  onCommentsLock,
  onDelete,
}: PostManageMenuProps) {
  const showContent =
    canEdit
    || (isOwnerOrAdmin && isEdited)
    || (isOwnerOrAdmin && post.post_type === 'question');
  const hint = editRemaining || (!canEdit && isOwnerOrAdmin ? editBlockReason : '') || '';
  /** 帖主删除入口（管理员在下方的危险区单独展示） */
  const showOwnerDelete = !isAdmin && isOwnerOrAdmin && (canDelete || !!deleteBlockReason);

  if (!showContent && !isAdmin && !hint && !showOwnerDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="post-manage-menu-trigger"
          aria-label="管理帖子"
        >
          {!isMobile && <span>管理</span>}
          <EllipsisVertical size={16} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="post-manage-menu">
        {hint && (
          <>
            <DropdownMenuLabel className="post-manage-menu-hint">
              {hint}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {showContent && (
          <>
            <DropdownMenuLabel>内容</DropdownMenuLabel>
            {canEdit && (
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil size={14} aria-hidden />
                编辑
              </DropdownMenuItem>
            )}
            {isOwnerOrAdmin && isEdited && (
              <DropdownMenuItem onSelect={onShowRevisions}>
                <History size={14} aria-hidden />
                编辑历史
              </DropdownMenuItem>
            )}
            {isOwnerOrAdmin && post.post_type === 'question' && (
              <DropdownMenuItem onSelect={onToggleResolved}>
                {post.question_resolved
                  ? <CircleHelp size={14} aria-hidden />
                  : <CircleCheck size={14} aria-hidden />}
                {post.question_resolved ? '标为未解决' : '标为已解决'}
              </DropdownMenuItem>
            )}
            {isAdmin && <DropdownMenuSeparator />}
          </>
        )}

        {showOwnerDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>危险</DropdownMenuLabel>
            {canDelete ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={deleting}
                onSelect={onDelete}
              >
                <Trash2 size={14} aria-hidden />
                删除
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="post-manage-menu-hint">
                <Trash2 size={14} aria-hidden />
                {deleteBlockReason || '已超过可删除时限，请联系管理员删除'}
              </DropdownMenuItem>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <DropdownMenuLabel>展示</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onFeature}>
              <Sparkles size={14} aria-hidden />
              {post.featured ? '取消推荐' : '设为推荐'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onPin}>
              <Pin size={14} aria-hidden />
              {post.pinned ? '取消全局置顶' : '全局置顶'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onBoardPin}>
              <Pin size={14} aria-hidden />
              {post.board_pinned ? '取消板块置顶' : '板块置顶'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuLabel>讨论</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onLock}>
              <Lock size={14} aria-hidden />
              {post.edit_locked ? '解锁编辑' : '锁定编辑'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onCommentsLock}>
              {post.comments_locked
                ? <LockOpen size={14} aria-hidden />
                : <MessageSquareOff size={14} aria-hidden />}
              {post.comments_locked ? '开放讨论' : '锁定讨论'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuLabel>危险</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={deleting}
              onSelect={onDelete}
            >
              <Trash2 size={14} aria-hidden />
              删除
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
