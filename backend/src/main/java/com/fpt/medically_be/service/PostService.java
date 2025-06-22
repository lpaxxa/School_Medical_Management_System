package com.fpt.medically_be.service;

import com.fpt.medically_be.dto.PageResponse;
import com.fpt.medically_be.dto.PostDTO;
import com.fpt.medically_be.entity.Post;

public interface PostService {
    PageResponse<PostDTO> getAllPosts(int page, int size);
    PostDTO getPostById(Long postId);
    PostDTO createPost(PostDTO postDTO, String authorId);
    PostDTO convertToDTO(Post post);
}
