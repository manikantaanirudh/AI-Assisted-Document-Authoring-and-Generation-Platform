import pytest
from fastapi import status

def test_create_project(client, auth_token):
    """Test creating a project."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    project_data = {
        "title": "Test Project",
        "doc_type": "docx",
        "topic": "Test topic"
    }
    response = client.post("/api/v1/projects", json=project_data, headers=headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == project_data["title"]
    assert data["doc_type"] == project_data["doc_type"]
    assert data["topic"] == project_data["topic"]

def test_list_projects(client, auth_token):
    """Test listing projects."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create a project first
    project_data = {
        "title": "Test Project",
        "doc_type": "docx",
        "topic": "Test topic"
    }
    client.post("/api/v1/projects", json=project_data, headers=headers)
    
    # List projects
    response = client.get("/api/v1/projects", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_project(client, auth_token):
    """Test getting a project."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create a project
    project_data = {
        "title": "Test Project",
        "doc_type": "docx",
        "topic": "Test topic"
    }
    create_response = client.post("/api/v1/projects", json=project_data, headers=headers)
    project_id = create_response.json()["id"]
    
    # Get project
    response = client.get(f"/api/v1/projects/{project_id}", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == project_id

def test_update_project(client, auth_token):
    """Test updating a project."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create a project
    project_data = {
        "title": "Test Project",
        "doc_type": "docx",
        "topic": "Test topic"
    }
    create_response = client.post("/api/v1/projects", json=project_data, headers=headers)
    project_id = create_response.json()["id"]
    
    # Update project
    update_data = {"title": "Updated Title"}
    response = client.put(f"/api/v1/projects/{project_id}", json=update_data, headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == update_data["title"]

def test_delete_project(client, auth_token):
    """Test deleting a project."""
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create a project
    project_data = {
        "title": "Test Project",
        "doc_type": "docx",
        "topic": "Test topic"
    }
    create_response = client.post("/api/v1/projects", json=project_data, headers=headers)
    project_id = create_response.json()["id"]
    
    # Delete project
    response = client.delete(f"/api/v1/projects/{project_id}", headers=headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deleted
    get_response = client.get(f"/api/v1/projects/{project_id}", headers=headers)
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

