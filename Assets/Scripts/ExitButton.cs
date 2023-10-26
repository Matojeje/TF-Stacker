using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ExitButton : MonoBehaviour
{
    public Button button;

    private void Start()
    {
        button.onClick.AddListener(Exit);
    }

    void Exit()
    {
        Application.Quit();
    }
}
