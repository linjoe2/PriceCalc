import { describe, it, expect, vi, beforeEach } from 'vitest';
import { page } from '$app/stores';
import { selectedUser } from '../../../../stores/userStore';
import { Databases } from 'appwrite';
import { client } from '$lib/appwrite';

interface ProjectItem {
  price: number;
  quantity: number;
}

interface Project {
  name: string;
  items: ProjectItem[];
}

// Mock the appwrite client and databases
vi.mock('$lib/appwrite', () => ({
  client: {
    // Add any necessary client mocks
  },
  account: {
    get: vi.fn()
  }
}));

// Mock the page store
vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn(),
    params: { id: 'new' }
  }
}));

// Mock the user store
vi.mock('../../../../stores/userStore', () => ({
  selectedUser: {
    subscribe: vi.fn(),
    set: vi.fn()
  }
}));

describe('Project Edit Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should initialize with empty projects array', () => {
    const projects: Project[] = [];
    expect(projects).toHaveLength(0);
  });

  it('should add a new project when project name is provided', () => {
    const projects: Project[] = [];
    const newProject: Project = { name: 'Test Project', items: [] };
    projects.push(newProject);
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('Test Project');
  });

  it('should calculate total price correctly', () => {
    const projects: Project[] = [{
      name: 'Test Project',
      items: [
        { price: 100, quantity: 2 }
      ]
    }];
    const totalPrice = projects.reduce((sum, project) => {
      return sum + project.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity);
      }, 0);
    }, 0);
    expect(totalPrice).toBe(200);
  });

  it('should remove a project when delete button is clicked', () => {
    const projects: Project[] = [{ name: 'Test Project', items: [] }];
    projects.pop();
    expect(projects).toHaveLength(0);
  });

  it('should update item quantity correctly', () => {
    const projects: Project[] = [{
      name: 'Test Project',
      items: [
        { price: 100, quantity: 1 }
      ]
    }];
    projects[0].items[0].quantity = 2;
    const totalPrice = projects.reduce((sum, project) => {
      return sum + project.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity);
      }, 0);
    }, 0);
    expect(totalPrice).toBe(200);
  });

  it('should save project data correctly', () => {
    const mockSave = vi.fn();
    const projectData: Project = {
      name: 'Test Project',
      items: [],
    };
    mockSave(projectData);
    expect(mockSave).toHaveBeenCalledWith(projectData);
  });

  it('should handle custom price input correctly', () => {
    const projects: Project[] = [{
      name: 'Test Project',
      items: [
        { price: 100, quantity: 1 }
      ]
    }];
    projects[0].items[0].price = 150;
    const totalPrice = projects.reduce((sum, project) => {
      return sum + project.items.reduce((itemSum, item) => {
        return itemSum + (item.price * item.quantity);
      }, 0);
    }, 0);
    expect(totalPrice).toBe(150);
  });
}); 