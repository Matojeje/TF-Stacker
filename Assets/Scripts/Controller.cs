using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.IO;

public class Controller : MonoBehaviour
{
    // Transformation Stack
    private TransformationNode head = null;

    // Initial Transformation
    private string firstTF = null;

    [Header("Folder Paths")]
    public string databasePath;
    public string characterImagesPath;
    public string transformationIconsPath;

    [Header("Image Paths")]
    public string imagePath;
    public string defaultImagePath;

    [Header("Names")]
    public string characterName;
    public string authorName;

    [Header("Object References")]
    public SpriteRenderer characterSprite;
    public Button undoButton;

    [Header("Useful Image Storage")]
    public Texture2D defaultTexture;
    public Sprite imageMissing;

    [Header("Lists")]
    public string[] transformations;
    public Button[] transformationButtons;

    // Transforms the character.
    public void TransformCharacter(string transformation)
    {
        // Push a transformation onto the stack.
        Debug.Log("Transforming into: " + transformation);
        PushTransformation(transformation);

        // Update the character's image.
        string trueImagePath = imagePath + ".png";
        UpdateCharacterImage(trueImagePath);
    }

    // Undoes the most recent transformation.
    public void UndoTransformation()
    {
        // Pop the most recent transformation from the stack.
        string tf = PopTransformation();
        Debug.Log("Undoing transformation: " + tf);

        // Re-enable that transformation's button.
        for (int i = 0; i < transformationButtons.Length; i++)
        {
            if (transformationButtons[i].GetComponent<TransformationButton>().transformation == tf)
            {
                transformationButtons[i].gameObject.SetActive(true);
            }
        }

        // Update the character's image.
        string trueImagePath = imagePath + ".png";
        UpdateCharacterImage(trueImagePath);
    }

    // Pushes a transformation onto the stack.
    public void PushTransformation(string transformation)
    {
        if (head == null)
        {
            // If this is the first transformation in the stack, save it and update the image path accordingly. Also show the undo button.
            firstTF = transformation;
            undoButton.gameObject.SetActive(true);
            imagePath = characterImagesPath + "\\" + firstTF + "\\" + characterName + "%" + firstTF;
        }
        else
        {
            // If this is a subsequent transformation, just update the image path.
            imagePath = imagePath + "%" + transformation;
        }

        // Add a new TransformationNode to the stack.
        TransformationNode newNode = new TransformationNode(transformation);
        newNode.next = head;
        head = newNode;

        // Print debug information to the console.
        Debug.Log("Pushed transformation: " + head.transformation);
        Debug.Log("Initial transformation: " + firstTF);
        Debug.Log("Image Path: " + imagePath + ".png");
    }

    // Pops a transformation from the stack.
    public string PopTransformation()
    {
        // Pop off the head transformation.
        string returnTF = head.transformation;
        head = head.next;

        // Update the image path.
        imagePath = imagePath.Remove((imagePath.Length - (returnTF.Length + 1)), (returnTF.Length + 1));

        // Check if the tf stack is empty, and if it is hide the undo button and update the path accordingly.
        if (head == null)
        {
            firstTF = null;
            imagePath = characterImagesPath + "\\" + characterName;
            undoButton.gameObject.SetActive(false);
        }

        // Print debug information to the console.
        Debug.Log("Popped transformation: " + returnTF);
        Debug.Log("Initial transformation: " + firstTF);
        Debug.Log("Image Path: " + imagePath + ".png");
        return returnTF;
    }

    // Update the character's image to that stored at the specified path, or to the placeholder if that image doesn't exist.
    public void UpdateCharacterImage(string newImagePath)
    {
        try
        {
            Texture2D texture = new Texture2D(2, 2);
            byte[] fileData = File.ReadAllBytes(newImagePath);
            texture.LoadImage(fileData);

            characterSprite.sprite = Sprite.Create(texture, new Rect(0, 0, texture.width, texture.height), new Vector2(0.5f, 0.5f));
        }
        catch
        {
            characterSprite.sprite = imageMissing;
            Debug.Log("Error: Image \"" + newImagePath + "\" could not be found.");
        }

    }
}

// Basic node class for the stack.
public class TransformationNode
{
    public string transformation;
    public TransformationNode next;

    public TransformationNode(string tf)
    {
        transformation = tf;
        next = null;
    }
}
