using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UndoButton : MonoBehaviour
{
    
    public Button button;
    public Controller controller;
    public bool active;

    private void Start()
    {
        button.onClick.AddListener(Undo);
    }

    void Undo()
    {
        controller.UndoTransformation();
    }
}
