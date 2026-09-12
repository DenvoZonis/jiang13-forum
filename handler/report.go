package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"git.iioio.com/freefire/jiang13-forum/service"
)

// APICreatePostReport 举报帖子
func (h *Handlers) APICreatePostReport(c *gin.Context) {
	postID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req struct {
		Reason string `json:"reason"`
		Detail string `json:"detail"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	rep, err := h.Report.Create(h.currentUserID(c), uint(postID), req.Reason, req.Detail)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "举报已提交，感谢反馈", "report": rep})
}

// APICreateCommentReport 举报评论
func (h *Handlers) APICreateCommentReport(c *gin.Context) {
	commentID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req struct {
		Reason string `json:"reason"`
		Detail string `json:"detail"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	rep, err := h.Report.CreateCommentReport(h.currentUserID(c), uint(commentID), req.Reason, req.Detail)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "举报已提交，感谢反馈", "report": rep})
}

// APIAdminReports 举报列表
func (h *Handlers) APIAdminReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	status := c.DefaultQuery("status", "pending")
	list, total, err := h.Report.ListAdmin(service.ReportListQuery{
		Status: status,
		Page:   page,
		Size:   size,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pending, _ := h.Report.PendingCount()
	c.JSON(http.StatusOK, gin.H{
		"reports":       list,
		"total":         total,
		"page":          page,
		"pending_count": pending,
		"status":        status,
	})
}

// APIAdminHandleReport 处理举报
func (h *Handlers) APIAdminHandleReport(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req struct {
		Action       string `json:"action"`
		HandleNote   string `json:"handle_note"`
		RejectReason string `json:"reject_reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}
	rep, err := h.Report.Handle(service.HandleReportInput{
		ReportID:     uint(id),
		HandlerID:    h.currentUserID(c),
		Action:       req.Action,
		HandleNote:   req.HandleNote,
		RejectReason: req.RejectReason,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "处理完成", "report": rep})
}

