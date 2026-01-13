/**
 * Temporary Client/Project Database Helper
 * 
 * This is a temporary helper that queries Client and Project directly from the database
 * during the migration phase. Once Client Service is created, this will be removed
 * and replaced with ClientServiceClient HTTP calls.
 * 
 * TODO: Remove this file once Client Service is fully implemented
 */

import mongoose from "mongoose";

// Temporary schemas for direct database access during migration
// These will be removed once Client Service is created
const clientSchema = new mongoose.Schema({
    name: { type: String },
    // Add other fields as needed
}, { collection: 'clients', strict: false });

const projectSchema = new mongoose.Schema({
    name: { type: String },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    // Add other fields as needed
}, { collection: 'projects', strict: false });

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export class ClientDBHelper {
    /**
     * Find client by ID (temporary - direct DB access)
     * @param {string} clientId - Client ID
     * @returns {Promise<Object>} Client object
     */
    static async findClientById(clientId) {
        try {
            const client = await Client.findById(clientId);
            if (!client) {
                throw new Error(`Client with ID '${clientId}' not found in the database`);
            }
            return client;
        } catch (error) {
            console.error('Error finding client:', error);
            throw error;
        }
    }

    /**
     * Find project by ID (temporary - direct DB access)
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Project object
     */
    static async findProjectById(projectId) {
        try {
            if (!projectId || projectId === "") {
                return null;
            }
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error(`Project with ID '${projectId}' not found in the database`);
            }
            return project;
        } catch (error) {
            console.error('Error finding project:', error);
            throw error;
        }
    }

    /**
     * Find client and project (temporary - direct DB access)
     * @param {string} clientId - Client ID
     * @param {string} projectId - Project ID (optional)
     * @returns {Promise<Object>} Object with client and project
     */
    static async findClientAndProject(clientId, projectId) {
        try {
            const client = await this.findClientById(clientId);
            const project = projectId ? await this.findProjectById(projectId) : null;
            return { client, project };
        } catch (error) {
            throw error;
        }
    }
}
