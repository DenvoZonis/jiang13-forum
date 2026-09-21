package service

import (
	"testing"

	"git.iioio.com/freefire/jiang13-forum/model"
)

func TestCanSeePrivateAuthor(t *testing.T) {
	s := &CommentService{}
	c := model.Comment{ID: 1, UserID: 100, IsPrivate: true}
	empty := map[uint]struct{}{}

	if !s.canSeePrivateAuthor(c, 1, true, empty) {
		t.Fatal("管理员应可见匿名评论作者")
	}
	if !s.canSeePrivateAuthor(c, 100, false, empty) {
		t.Fatal("评论作者本人应可见自己的身份")
	}
	if s.canSeePrivateAuthor(c, 200, false, empty) {
		t.Fatal("其他普通用户不应可见匿名评论作者")
	}
	// 非匿名评论对所有人可见作者
	pub := model.Comment{ID: 2, UserID: 100}
	if !s.canSeePrivateAuthor(pub, 200, false, empty) {
		t.Fatal("普通评论作者应对所有人可见")
	}
	// 游客作者凭 guestSet 可见自己
	if !s.canSeePrivateAuthor(c, 0, false, map[uint]struct{}{1: {}}) {
		t.Fatal("游客作者应可见自己的身份")
	}
}

func TestMaskCommentAuthor(t *testing.T) {
	c := model.Comment{
		ID:         1,
		UserID:     100,
		IsPrivate:  true,
		GuestNick:  "guest",
		GuestEmail: "a@b.c",
		GuestURL:   "https://example.com",
		User:       model.User{ID: 100, Nickname: "Alice"},
		Content:    "<p>hi</p>",
	}
	maskCommentAuthor(&c)
	if !c.AuthorHidden {
		t.Fatal("AuthorHidden 应为 true")
	}
	if c.UserID != 0 || c.User.ID != 0 || c.User.Nickname != "" {
		t.Fatal("应清除注册用户身份")
	}
	if c.GuestNick != "" || c.GuestEmail != "" || c.GuestURL != "" {
		t.Fatal("应清除游客身份")
	}
	if c.Content != "<p>hi</p>" {
		t.Fatal("应保留评论正文")
	}
}
